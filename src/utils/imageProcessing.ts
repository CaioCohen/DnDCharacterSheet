import type { CharacterImage } from '@/types/character';

const MAX_IMAGE_BYTES = 1024 * 1024;
const MAX_DIMENSION = 1200;
const MIN_DIMENSION = 320;
const INITIAL_QUALITY = 0.92;
const MIN_QUALITY = 0.55;
const QUALITY_STEP = 0.08;
const DIMENSION_SCALE_STEP = 0.85;

const isProbablyImageFile = (file: File): boolean => {
  if (file.type.startsWith('image/')) {
    return true;
  }

  return /\.(avif|bmp|gif|heic|heif|jpeg|jpg|png|webp)$/i.test(file.name);
};

const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load the selected image.'));
    };

    image.src = objectUrl;
  });
};

const createCanvas = (image: HTMLImageElement, width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create an image processing canvas.');
  }

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas;
};

const getEstimatedBytes = (dataUrl: string): number => {
  const base64 = dataUrl.split(',')[1] ?? '';
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
};

const canvasToImageDataUrl = (canvas: HTMLCanvasElement, quality: number): string => {
  return canvas.toDataURL('image/jpeg', quality);
};

const resizeDimensions = (width: number, height: number): { width: number; height: number } => {
  const maxSide = Math.max(width, height);

  if (maxSide <= MAX_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_DIMENSION / maxSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
};

export const processCharacterImage = async (file: File): Promise<CharacterImage> => {
  if (!isProbablyImageFile(file)) {
    throw new Error('Please select an image file.');
  }

  const image = await loadImage(file);
  const sourceName = file.name.replace(/\.[^.]+$/, '') || 'portrait';
  let { width, height } = resizeDimensions(image.naturalWidth || image.width, image.naturalHeight || image.height);
  let quality = INITIAL_QUALITY;

  let canvas = createCanvas(image, width, height);
  let dataUrl = canvasToImageDataUrl(canvas, quality);

  while (getEstimatedBytes(dataUrl) > MAX_IMAGE_BYTES) {
    if (quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
      dataUrl = canvasToImageDataUrl(canvas, quality);
      continue;
    }

    const nextWidth = Math.max(MIN_DIMENSION, Math.round(width * DIMENSION_SCALE_STEP));
    const nextHeight = Math.max(MIN_DIMENSION, Math.round(height * DIMENSION_SCALE_STEP));

    if (nextWidth === width && nextHeight === height) {
      break;
    }

    width = nextWidth;
    height = nextHeight;
    quality = INITIAL_QUALITY;
    canvas = createCanvas(image, width, height);
    dataUrl = canvasToImageDataUrl(canvas, quality);
  }

  if (getEstimatedBytes(dataUrl) > MAX_IMAGE_BYTES) {
    throw new Error('The image could not be compressed to about 1 MB. Try a smaller file.');
  }

  return {
    name: `${sourceName}.jpg`,
    type: 'image/jpeg',
    dataUrl
  };
};
