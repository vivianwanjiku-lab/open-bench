import type { StationPhoto } from "@/types";

const MAX_EDGE = 1280;
const MAX_FILES = 4;

export function maxPhotos(): number {
  return MAX_FILES;
}

export async function fileToPhoto(file: File): Promise<StationPhoto> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Please choose an image under 8 MB.");
  }
  const src = await resizeImage(file);
  return {
    src,
    alt: "Photo of the changing room",
  };
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not read that image."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image. Try a JPEG or PNG."));
    };
    image.src = url;
  });
}
