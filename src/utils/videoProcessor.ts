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
    await ffmpeg.createDir('/tmp');

    for (let i = 0; i < images.length; i++) {
      const response = await fetch(images[i]);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      await ffmpeg.writeFile(`/tmp/image${i}.jpg`, new Uint8Array(arrayBuffer));
    }

    const duration = Math.max(1, images.length) * 5;

    const args: string[] = [];
    for (let i = 0; i < images.length; i++) {
      args.push('-loop', '1', '-t', '5', '-i', `/tmp/image${i}.jpg`);
    }

    const scales = Array.from({ length: images.length }, (_, i) => `[${i}:v]scale=1280:720,setsar=1[v${i}]`).join(';');
    const concatInputs = Array.from({ length: images.length }, (_, i) => `[v${i}]`).join('');
    const filter = `${scales};${concatInputs}concat=n=${images.length}:v=1:a=0,format=yuv420p[v]`;

    args.push('-filter_complex', filter, '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '23', '/tmp/video.mp4');

    await ffmpeg.exec(args);

    await ffmpeg.exec(['-i', '/tmp/video.mp4', '-vf', `drawtext=text='${blessingText}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=10:x=(w-text_w)/2:y=(h-text_h)/2`, '-an', '/tmp/video_text.mp4']);

    let finalPath = '/tmp/video_text.mp4';

    if (musicUrl && musicUrl.length > 0) {
      if (musicUrl === 'default') {
        await ffmpeg.exec(['-f', 'lavfi', '-i', `sine=frequency=261.63:sample_rate=44100:duration=${duration}`, '-c:a', 'aac', '-b:a', '128k', '/tmp/music.m4a']);
      } else {
        const musicResp = await fetch(musicUrl);
        const musicBlob = await musicResp.blob();
        const musicBuf = new Uint8Array(await musicBlob.arrayBuffer());
        await ffmpeg.writeFile('/tmp/music', musicBuf);
      }

      const musicInput = musicUrl === 'default' ? '/tmp/music.m4a' : '/tmp/music';
      await ffmpeg.exec(['-i', '/tmp/video_text.mp4', '-i', musicInput, '-c:v', 'copy', '-c:a', 'aac', '-shortest', '/tmp/final.mp4']);
      finalPath = '/tmp/final.mp4';
    }

    const data = await ffmpeg.readFile(finalPath);
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
