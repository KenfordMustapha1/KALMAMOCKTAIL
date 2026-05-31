const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const compressImageFile = (file, maxWidth = 800, quality = 0.82) => {
  if (file.size > MAX_IMAGE_BYTES) {
    return Promise.reject(new Error('Image is too large. Please use a file under 5MB.'));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      img.onerror = () => reject(new Error('Failed to process image.'));
      img.src = event.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};
