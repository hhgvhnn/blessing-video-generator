import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useProjectStore } from '@/stores/projectStore';
import { getTemplates, createProject } from '@/utils/supabase';
import { Template } from '@/types';
import { Upload, Music, Image, ArrowRight, ArrowLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const Create = () => {
  const navigate = useNavigate();
  const { currentProject, setCurrentProject, templates, setTemplates } = useProjectStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    recipientName: currentProject?.recipient_name || '',
    blessingText: currentProject?.blessing_text || '',
    templateId: currentProject?.template_id || '',
    images: currentProject?.images || [],
    musicUrl: currentProject?.music_url || ''
  });
  
  const [uploadedImages, setUploadedImages] = useState<string[]>(formData.images);
  const [isLoading, setIsLoading] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to load templates:', error);
      }
    };
    loadTemplates();
  }, [setTemplates]);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const projectData = {
        recipient_name: formData.recipientName,
        blessing_text: formData.blessingText,
        template_id: formData.templateId,
        images: uploadedImages,
        music_url: formData.musicUrl,
        status: 'draft'
      };

      let project;
      if (currentProject?.id) {
        // Update existing project
        // This would require an update function
        project = { ...currentProject, ...projectData };
      } else {
        // Create new project
        project = await createProject(projectData);
      }

      setCurrentProject(project);
      navigate('/preview');
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">基本信息</h2>
            <Input
              label="收祝福人姓名"
              placeholder="请输入收祝福人的姓名"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              required
            />
            <Textarea
              label="祝福语"
              placeholder="写下你的温馨祝福..."
              value={formData.blessingText}
              onChange={(e) => setFormData({ ...formData, blessingText: e.target.value })}
              required
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">选择模板</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template: Template) => (
                <div
                  key={template.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    formData.templateId === template.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                  onClick={() => setFormData({ ...formData, templateId: template.id })}
                >
                  <div className="aspect-video bg-gray-200 rounded mb-4">
                    <img 
                      src={template.preview_url || `https://via.placeholder.com/400x225/FFC0CB/FFFFFF?text=${template.name}`} 
                      alt={template.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.category}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">上传照片</h2>
            <div 
              {...getImageRootProps()} 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-pink-400 transition-colors duration-200"
            >
              <input {...getImageInputProps()} />
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">点击或拖拽图片到这里</p>
              <p className="text-sm text-gray-500">支持 JPG、PNG、GIF 格式，最多5张</p>
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">选择音乐</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <div className="flex items-center">
                  <Music className="w-6 h-6 text-pink-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">温馨背景音乐</h4>
                    <p className="text-sm text-gray-600">轻柔的钢琴曲</p>
                  </div>
                  <input
                    type="radio"
                    name="music"
                    value="default"
                    checked={formData.musicUrl === 'default'}
                    onChange={(e) => setFormData({ ...formData, musicUrl: e.target.value })}
                    className="ml-auto"
                  />
                </div>
              </div>
              
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <div className="flex items-center">
                  <Upload className="w-6 h-6 text-pink-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">上传自定义音乐</h4>
                    <p className="text-sm text-gray-600">选择你自己的音乐文件</p>
                  </div>
                  <input
                    type="radio"
                    name="music"
                    value="custom"
                    checked={formData.musicUrl !== '' && formData.musicUrl !== 'default'}
                    onChange={() => setFormData({ ...formData, musicUrl: '' })}
                    className="ml-auto"
                  />
                </div>
              </div>
            </div>
            
            {formData.musicUrl !== 'default' && (
              <div className="mt-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setFormData({ ...formData, musicUrl: url });
                      setAudioPreviewUrl(url);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                {audioPreviewUrl && (
                  <audio src={audioPreviewUrl} controls className="mt-3 w-full" />
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= stepNumber
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div
                  className={`w-16 h-1 ${
                    step > stepNumber ? 'bg-pink-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {renderStep()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 1}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              上一步
            </Button>
            
            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={step === 1 && (!formData.recipientName || !formData.blessingText)}
                className="flex items-center"
              >
                下一步
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                isLoading={isLoading}
                disabled={!formData.templateId || uploadedImages.length === 0}
              >
                预览视频
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
