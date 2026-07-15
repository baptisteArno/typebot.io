import type { FileCaptureMode } from "@typebot.io/blocks-inputs/file/constants";
import { parseAllowedFileTypesMetadata } from "@typebot.io/lib/extensionFromMimeType";

/**
 * Adds Android camera workaround to file types when no standard capture attribute is selected.
 * Matching image MIME types are always added so extension allowlists can activate media capture.
 */
export const injectAndroidCameraCaptureToMimeTypes = (
  types?: string[],
  capture?: FileCaptureMode,
): string => {
  if (!types || types.length === 0) return "";

  const fileTypeIndexFromNormalizedFileType = new Map<string, number>();
  const uniqueFileTypes = types.reduce<string[]>((uniqueFileTypes, type) => {
    const trimmedType = type.trim();
    const normalizedFileType = normalizeFileType(trimmedType);
    const existingFileTypeIndex =
      fileTypeIndexFromNormalizedFileType.get(normalizedFileType);

    if (
      !normalizedFileType ||
      (capture && normalizedFileType === "capture=camera")
    )
      return uniqueFileTypes;

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

  const imageMimeTypesFromExtensions = parseAllowedFileTypesMetadata(
    uniqueFileTypes.filter(
      (fileType) => !normalizeFileType(fileType).includes("/"),
    ),
  ).flatMap(({ mimeType }) => {
    const normalizedMimeType = normalizeFileType(mimeType);

    if (
      !normalizedMimeType.startsWith("image/") ||
      normalizedFileTypes.has(normalizedMimeType)
    )
      return [];

    normalizedFileTypes.add(normalizedMimeType);
    return [mimeType];
  });

  if (![...normalizedFileTypes].some((type) => type.startsWith("image/")))
    return uniqueFileTypes.join(", ");

  if (capture || normalizedFileTypes.has("capture=camera"))
    return [...uniqueFileTypes, ...imageMimeTypesFromExtensions].join(", ");

  return [
    ...uniqueFileTypes,
    ...imageMimeTypesFromExtensions,
    "capture=camera",
  ].join(", ");
};

const normalizeFileType = (fileType: string) =>
  fileType.trim().toLowerCase().replace(/^\./, "");
