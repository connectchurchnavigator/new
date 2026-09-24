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
  maxFileSizeMB?: number;
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
    maxFileSizeMB = 2.5,
  } = options;

  return new Promise((resolve, reject) => {
    let srcUrl = "";
    let isObjectUrl = false;
    const isFile = typeof fileOrDataUrl !== "string" && fileOrDataUrl instanceof File;

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
        // If canvas context fails and image is too large, throw helpful error
        if (isFile && fileOrDataUrl.size > maxFileSizeMB * 1024 * 1024) {
          reject(new Error(`The uploaded image exceeds the allowed capacity (${(fileOrDataUrl.size / (1024 * 1024)).toFixed(1)}MB). Please reduce the image resolution or file size to less than 2 MB before uploading.`));
          return;
        }
        resolve(typeof fileOrDataUrl === "string" ? fileOrDataUrl : srcUrl);
        return;
      }

      // Draw and compress
      try {
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(compressedDataUrl);
      } catch (err) {
        console.warn("Canvas compression failed:", err);
        if (isFile && fileOrDataUrl.size > maxFileSizeMB * 1024 * 1024) {
          reject(new Error(`The uploaded image exceeds the allowed capacity (${(fileOrDataUrl.size / (1024 * 1024)).toFixed(1)}MB). Please reduce the image resolution or file size before uploading.`));
          return;
        }
        resolve(typeof fileOrDataUrl === "string" ? fileOrDataUrl : srcUrl);
      }
    };

    img.onerror = () => {
      if (isObjectUrl) {
        URL.revokeObjectURL(srcUrl);
      }
      if (isFile && fileOrDataUrl.size > maxFileSizeMB * 1024 * 1024) {
        reject(new Error(`The uploaded image exceeds the allowed capacity (${(fileOrDataUrl.size / (1024 * 1024)).toFixed(1)}MB). Please reduce the image resolution or file size before uploading.`));
        return;
      }
      reject(new Error("Unable to read or process the selected image file. Please try another image."));
    };

    img.src = srcUrl;
  });
}
