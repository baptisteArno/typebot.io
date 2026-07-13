import { extensionFromMimeType } from "@typebot.io/lib/extensionFromMimeType";

/**
 * Adds Android camera workaround to file types to ensure camera option appears on Android devices.
 * This addresses an issue in Android 14+ where the camera option doesn't appear for image accept types.
 */
export const injectAndroidCameraCaptureToMimeTypes = (
  types?: string[],
): string => {
  if (!types || types.length === 0) return "";

  const fileTypeIndexFromNormalizedFileType = new Map<string, number>();
  const uniqueFileTypes = types.reduce<string[]>((uniqueFileTypes, type) => {
    const trimmedType = type.trim();
    const normalizedFileType = normalizeFileType(trimmedType);
    const existingFileTypeIndex =
      fileTypeIndexFromNormalizedFileType.get(normalizedFileType);

    if (!normalizedFileType) return uniqueFileTypes;

    if (existingFileTypeIndex === undefined) {
      fileTypeIndexFromNormalizedFileType.set(
        normalizedFileType,
        uniqueFileTypes.length,
      );
      uniqueFileTypes.push(trimmedType);
      return uniqueFileTypes;
    }

    if (
      trimmedType.startsWith(".") &&
      uniqueFileTypes[existingFileTypeIndex]?.startsWith(".") === false
    )
      uniqueFileTypes[existingFileTypeIndex] = trimmedType;

    return uniqueFileTypes;
  }, []);
  const normalizedFileTypes = new Set(
    fileTypeIndexFromNormalizedFileType.keys(),
  );

  const imageMimeTypesFromExtensions = uniqueFileTypes.flatMap((fileType) =>
    Object.entries(extensionFromMimeType).flatMap(([mimeType, extension]) => {
      const normalizedMimeType = normalizeFileType(mimeType);

      if (
        !normalizedMimeType.startsWith("image/") ||
        normalizeFileType(fileType) !== normalizeFileType(extension) ||
        normalizedFileTypes.has(normalizedMimeType)
      )
        return [];

      normalizedFileTypes.add(normalizedMimeType);
      return [mimeType];
    }),
  );

  if (![...normalizedFileTypes].some((type) => type.startsWith("image/")))
    return uniqueFileTypes.join(", ");

  if (normalizedFileTypes.has("capture=camera"))
    return [...uniqueFileTypes, ...imageMimeTypesFromExtensions].join(", ");

  return [
    ...uniqueFileTypes,
    ...imageMimeTypesFromExtensions,
    "capture=camera",
  ].join(", ");
};

const normalizeFileType = (fileType: string) =>
  fileType.trim().toLowerCase().replace(/^\./, "");
