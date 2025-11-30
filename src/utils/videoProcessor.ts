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

    const imageFiles: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const response = await fetch(images[i]);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const mime = blob.type || 'image/jpeg';
      const ext = mime.includes('png') ? 'png' : 'jpg';
      const fileName = `/tmp/image${i}.${ext}`;
      await ffmpeg.writeFile(fileName, new Uint8Array(arrayBuffer));
      imageFiles.push(fileName);
    }

    const duration = Math.max(1, images.length) * 5;

    const args: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      args.push('-loop', '1', '-t', '5', '-i', imageFiles[i]);
    }

    if (images.length === 1) {
      // Single image case: scale and encode without concat
      await ffmpeg.exec([
        ...args,
        '-filter:v', 'scale=1280:720,setsar=1,format=yuv420p',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'medium',
        '-crf', '23',
        '/tmp/video.mp4'
      ]);
    } else {
      const scales = Array.from({ length: images.length }, (_, i) => `[${i}:v]scale=1280:720,setsar=1[v${i}]`).join(';');
      const concatInputs = Array.from({ length: images.length }, (_, i) => `[v${i}]`).join('');
      const filter = `${scales};${concatInputs}concat=n=${images.length}:v=1:a=0,format=yuv420p[v]`;

      await ffmpeg.exec([
        ...args,
        '-filter_complex', filter,
        '-map', '[v]',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'medium',
        '-crf', '23',
        '/tmp/video.mp4'
      ]);
    }

    // Try to overlay blessing text; if drawtext fails due to fonts, fallback to original video
    let textApplied = true;
    const escapeDrawtext = (text: string) =>
      text
        .replace(/\\/g, '\\\\')
        .replace(/:/g, '\\:')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n');
    const safeText = escapeDrawtext(blessingText);
    try {
      await ffmpeg.exec([
        '-i', '/tmp/video.mp4',
        '-vf', `drawtext=text='${safeText}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=10:x=(w-text_w)/2:y=(h-text_h)/2`,
        '-an', '/tmp/video_text.mp4'
      ]);
    } catch (e) {
      console.warn('drawtext failed, using video without text overlay', e);
      textApplied = false;
    }

    let finalPath = '/tmp/video_text.mp4';
    if (!textApplied) {
      finalPath = '/tmp/video.mp4';
    }

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
      await ffmpeg.exec(['-i', finalPath, '-i', musicInput, '-c:v', 'copy', '-c:a', 'aac', '-shortest', '/tmp/final.mp4']);
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
