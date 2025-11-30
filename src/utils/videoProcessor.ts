import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const initFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
};

export const generateBlessingVideo = async (
  images: string[],
  blessingText: string,
  recipientName: string,
  musicUrl?: string,
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  if (!ffmpeg) {
    throw new Error('FFmpeg not initialized');
  }

  // Set progress callback
  ffmpeg.on('progress', ({ progress }) => {
    if (onProgress) {
      onProgress(Math.round(progress * 100));
    }
  });

  try {
    // Create temporary directory
    await ffmpeg.createDir('/tmp');

    // Write images to FFmpeg
    for (let i = 0; i < images.length; i++) {
      const response = await fetch(images[i]);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      await ffmpeg.writeFile(`/tmp/image${i}.jpg`, new Uint8Array(arrayBuffer));
    }

    // Create video from images (5 seconds per image)
    const imageInputs = images.map((_, i) => `-loop 1 -t 5 -i /tmp/image${i}.jpg`).join(' ');
    const filterComplex = images.map((_, i) => `[${i}:v]`).join('') + 
      `concat=n=${images.length}:v=1:a=0,format=yuv420p[v]`;

    await ffmpeg.exec([
      '-i', '/tmp/image0.jpg',
      '-i', '/tmp/image1.jpg',
      '-i', '/tmp/image2.jpg',
      '-filter_complex', filterComplex,
      '-map', '[v]',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-preset', 'medium',
      '-crf', '23',
      '/tmp/output.mp4'
    ]);

    // Add text overlay with blessing
    await ffmpeg.exec([
      '-i', '/tmp/output.mp4',
      '-vf', `drawtext=text='${blessingText}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=10:x=(w-text_w)/2:y=(h-text_h)/2`,
      '-c:a', 'copy',
      '/tmp/final.mp4'
    ]);

    // Read the final video
    const data = await ffmpeg.readFile('/tmp/final.mp4');
    
    // Clean up
    await ffmpeg.deleteDir('/tmp');

    return new Blob([data], { type: 'video/mp4' });
  } catch (error) {
    console.error('Video generation error:', error);
    throw error;
  }
};

export const cleanupFFmpeg = () => {
  if (ffmpeg) {
    ffmpeg.terminate();
    ffmpeg = null;
  }
};