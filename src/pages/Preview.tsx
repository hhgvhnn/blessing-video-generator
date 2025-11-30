import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useProjectStore } from '@/stores/projectStore';
import { initFFmpeg, generateBlessingVideo, cleanupFFmpeg } from '@/utils/videoProcessor';
import { updateProject } from '@/utils/supabase';
import { Play, Pause, RotateCcw, Download, Share2, ArrowLeft } from 'lucide-react';

const Preview = () => {
  const navigate = useNavigate();
  const { currentProject, videoGeneration, setVideoGeneration, updateVideoProgress } = useProjectStore();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingRef = useRef(false);

  useEffect(() => {
    if (!currentProject) {
      navigate('/create');
      return;
    }

    // Generate video preview (guard StrictMode double-run)
    if (!generatingRef.current) {
      generateVideo();
    }

    return () => {
      if (!generatingRef.current) {
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }
        cleanupFFmpeg();
      }
    };
  }, [currentProject, navigate]);

  

  const generateVideo = async () => {
    if (!currentProject) return;

    if (generatingRef.current) return;
    generatingRef.current = true;
    setIsGenerating(true);
    setVideoGeneration({
      progress: 0,
      status: 'generating'
    });

    try {
      // Initialize FFmpeg
      await initFFmpeg();

      // Generate video with progress tracking
      const blob = await generateBlessingVideo(
        currentProject.images,
        currentProject.blessing_text,
        currentProject.recipient_name,
        currentProject.music_url,
        (progress) => {
          updateVideoProgress(progress);
        }
      );
      setVideoBlob(blob);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      
      setVideoGeneration({
        progress: 100,
        status: 'completed',
        videoUrl: url
      });

      // Update project with generated video
      await updateProject(currentProject.id, {
        video_url: url,
        status: 'completed'
      });

    } catch (error) {
      console.error('Video generation failed:', error);
      setVideoGeneration({
        progress: 0,
        status: 'error',
        error: '视频生成失败，请重试'
      });
    } finally {
      setIsGenerating(false);
      generatingRef.current = false;
    }
  };

  const togglePlay = () => {
    const video = document.querySelector('video');
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `blessing-video-${currentProject?.recipient_name || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareVideo = async () => {
    if (navigator.share && videoBlob) {
      try {
        const file = new File([videoBlob], 'blessing-video.mp4', { type: 'video/mp4' });
        
        await navigator.share({
          title: '祝福视频',
          text: `为${currentProject?.recipient_name}制作的祝福视频`,
          files: [file]
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy video URL to clipboard
      navigator.clipboard.writeText(videoUrl);
      alert('视频链接已复制到剪贴板');
    }
  };

  if (!currentProject) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/create')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回编辑
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">视频预览</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateVideo}
              disabled={isGenerating}
              className="flex items-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              重新生成
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">视频预览</h2>
            
            {isGenerating ? (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                  </div>
                  <p className="text-gray-600 mb-2">正在生成视频...</p>
                  <p className="text-sm text-gray-500">{videoGeneration.progress}%</p>
                  <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${videoGeneration.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : videoGeneration.status === 'error' ? (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-500 text-2xl">!</span>
                  </div>
                  <p className="text-red-600 mb-2">{videoGeneration.error}</p>
                  <Button onClick={generateVideo} size="sm">
                    重试
                  </Button>
                </div>
              </div>
            ) : videoUrl ? (
              <div className="relative">
                <video
                  src={videoUrl}
                  className="w-full aspect-video rounded-lg bg-gray-100"
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={togglePlay}
                    className="flex items-center"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    {isPlaying ? '暂停' : '播放'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">点击重新生成来创建视频</p>
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">项目信息</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">收祝福人：</span>
                  <p className="font-medium text-gray-900">{currentProject.recipient_name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">祝福语：</span>
                  <p className="text-gray-900">{currentProject.blessing_text}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">照片数量：</span>
                  <p className="text-gray-900">{currentProject.images.length} 张</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">模板：</span>
                  <p className="text-gray-900">{currentProject.template_id}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {videoGeneration.status === 'completed' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">分享与下载</h2>
                <div className="space-y-3">
                  <Button 
                    onClick={downloadVideo}
                    className="w-full flex items-center justify-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载视频
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={shareVideo}
                    className="w-full flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    分享视频
                  </Button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {currentProject.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">照片预览</h2>
                <div className="grid grid-cols-2 gap-3">
                  {currentProject.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
