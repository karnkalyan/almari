/**
 * Utility functions for image processing, compression, and file reading.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMb?: number;
}

/**
 * Validates whether the given file is an acceptable image.
 */
export const validateImageFile = (file: File, maxSizeMb = 10): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select a valid image file (JPEG, PNG, WebP, SVG, GIF)' };
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return { valid: false, error: `Image size must be less than ${maxSizeMb}MB` };
  }
  return { valid: true };
};

/**
 * Reads a File directly to a base64 Data URL.
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Compresses and optimizes an image file client-side using an offscreen canvas.
 * Scales large dimensions to fit within maxWidth/maxHeight and outputs high-quality WebP or JPEG.
 * Preserves SVG and animated GIF as original data URLs to prevent rasterization.
 */
export const compressAndOptimizeImage = async (
  file: File,
  options: CompressOptions = {}
): Promise<string> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.88,
  } = options;

  // Preserve SVGs and GIFs in original format
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return fileToDataUrl(file);
  }

  // If file is already small (under 150KB), just read directly
  if (file.size < 150 * 1024) {
    return fileToDataUrl(file);
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to uncompressed data URL
          resolve(event.target?.result as string);
          return;
        }

        // Apply high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for great compression, fallback to JPEG
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // Fallthrough
        }

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };

      img.onerror = () => {
        // Fallback to raw data URL if image loading fails
        resolve(event.target?.result as string);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve('');
    };

    reader.readAsDataURL(file);
  });
};
