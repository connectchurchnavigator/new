/**
 * Compresses an image File or Data URL to a lightweight WebP/JPEG data URL
 * using an HTML5 Canvas to prevent 413 "Request Entity Too Large" errors
 * when sending forms to Next.js API routes or saving to localStorage.
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

export async function compressImage(
  fileOrDataUrl: File | string,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.8,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    // 1. Get raw source url
    let srcUrl = "";
    let isObjectUrl = false;

    if (typeof fileOrDataUrl === "string") {
      srcUrl = fileOrDataUrl;
    } else {
      srcUrl = URL.createObjectURL(fileOrDataUrl);
      isObjectUrl = true;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (isObjectUrl) {
        URL.revokeObjectURL(srcUrl);
      }

      let { width, height } = img;

      // Calculate scale ratio while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Fallback to original if canvas fails
        resolve(typeof fileOrDataUrl === "string" ? fileOrDataUrl : srcUrl);
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn("Canvas compression failed, falling back to original string", err);
        resolve(typeof fileOrDataUrl === "string" ? fileOrDataUrl : srcUrl);
      }
    };

    img.onerror = (e) => {
      if (isObjectUrl) {
        URL.revokeObjectURL(srcUrl);
      }
      reject(new Error("Failed to load image for compression"));
    };

    img.src = srcUrl;
  });
}
