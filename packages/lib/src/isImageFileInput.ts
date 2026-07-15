import { parseAllowedFileTypesMetadata } from "./extensionFromMimeType";

export const isImageFileInput = (allowedFileTypes?: {
  isEnabled?: boolean;
  types?: string[];
}) => {
  if (
    allowedFileTypes?.isEnabled !== true ||
    allowedFileTypes.types === undefined
  )
    return false;

  const effectiveAllowedFileTypes = allowedFileTypes.types.filter(
    (fileType) => fileType.trim().toLowerCase() !== "capture=camera",
  );

  return (
    effectiveAllowedFileTypes.length > 0 &&
    effectiveAllowedFileTypes.every((fileType) => {
      const fileTypesMetadata = parseAllowedFileTypesMetadata([fileType]);
      return (
        fileTypesMetadata.length > 0 &&
        fileTypesMetadata.every(({ mimeType }) => mimeType.startsWith("image/"))
      );
    })
  );
};
