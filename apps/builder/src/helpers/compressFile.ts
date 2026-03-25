const presets = {
  regular: { maxDimension: 1600, quality: 0.82 },
  icon: { maxDimension: 256, quality: 0.7 },
} as const;

export type CompressPreset = keyof typeof presets;

const COMPRESSIBLE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const compressFile = async (
  file: File,
  preset: CompressPreset = "regular",
): Promise<File> => {
  const { maxDimension, quality } = presets[preset];

  if (!COMPRESSIBLE_TYPES.has(file.type)) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await canvas.convertToBlob({ type: outputType, quality });
  const outputExt = outputType === "image/png" ? ".png" : ".jpg";

  return new File([blob], file.name.replace(/\.[^.]+$/, outputExt), {
    type: outputType,
  });
};
