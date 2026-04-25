// Utilities to process media files for AI chat: images, videos, PDFs.

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/** Convert any File/Blob to a data URL (base64). */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Resize/compress an image file to keep payload small for the AI.
 * Returns a JPEG data URL with max dimension `maxDim` and quality `quality`.
 */
export async function compressImage(
  file: File,
  maxDim = 1280,
  quality = 0.85,
): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Extract N evenly spaced frames from a video file as JPEG data URLs.
 */
export async function extractVideoFrames(
  file: File,
  frameCount = 3,
  maxDim = 1024,
  quality = 0.8,
): Promise<string[]> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Failed to load video'));
    });

    const duration = isFinite(video.duration) ? video.duration : 0;
    if (duration <= 0) throw new Error('Could not determine video duration');

    let { videoWidth: width, videoHeight: height } = video;
    if (width > maxDim || height > maxDim) {
      const ratio = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const frames: string[] = [];
    for (let i = 0; i < frameCount; i++) {
      // pick times at 10%, 50%, 90% (or evenly for other counts)
      const t = frameCount === 1
        ? duration / 2
        : (duration * (i + 1)) / (frameCount + 1);
      await seekVideo(video, t);
      ctx.drawImage(video, 0, 0, width, height);
      frames.push(canvas.toDataURL('image/jpeg', quality));
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      // small delay to ensure frame is painted
      setTimeout(resolve, 50);
    };
    const onError = () => {
      video.removeEventListener('error', onError);
      reject(new Error('Video seek failed'));
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.1));
  });
}

/**
 * Extract text content from a PDF using pdfjs-dist.
 * Returns concatenated text from all pages (truncated to maxChars).
 */
export async function extractPdfText(file: File, maxChars = 50_000): Promise<string> {
  // Dynamically import to keep initial bundle small
  const pdfjs = await import('pdfjs-dist');
  // Use the bundled worker via Vite's ?url import
  // @ts-ignore - vite worker URL
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it: any) => ('str' in it ? it.str : ''))
      .join(' ');
    fullText += `\n\n--- Page ${i} ---\n${pageText}`;
    if (fullText.length > maxChars) {
      fullText = fullText.slice(0, maxChars) + '\n\n[...truncated...]';
      break;
    }
  }
  return fullText.trim();
}

/** Read a plain text file (txt, md, csv, json, etc.) as string. */
export async function readTextFile(file: File, maxChars = 50_000): Promise<string> {
  const text = await file.text();
  return text.length > maxChars ? text.slice(0, maxChars) + '\n\n[...truncated...]' : text;
}
