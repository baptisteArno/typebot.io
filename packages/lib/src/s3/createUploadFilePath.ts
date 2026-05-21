import { createId } from "../createId";
import { extensionFromMimeType } from "../extensionFromMimeType";

const fallbackUploadFileType = "application/octet-stream";
const fallbackUploadFileExtension = "bin";

const unsafeUploadFileTypes = new Set([
  "image/svg+xml",
  "text/html",
  "text/xml",
  "application/xml",
  "application/xhtml+xml",
  "application/javascript",
  "application/ecmascript",
  "text/javascript",
  "text/ecmascript",
]);

export const normalizeUploadFileType = (
  fileType: string | undefined,
): string | undefined =>
  fileType?.toLowerCase().split(";")[0]?.trim() || undefined;

export const resolveUploadFileType = (fileType: string | undefined): string =>
  normalizeUploadFileType(fileType) ?? fallbackUploadFileType;

export const isUnsafeUploadFileType = (
  fileType: string | undefined,
): boolean => {
  const normalizedFileType = normalizeUploadFileType(fileType);

  return normalizedFileType
    ? unsafeUploadFileTypes.has(normalizedFileType)
    : false;
};

export const resolveStoredUploadFileType = (fileType: string): string =>
  isUnsafeUploadFileType(fileType) ? fallbackUploadFileType : fileType;

export const resolveUploadContentDisposition = (
  fileType: string,
): "attachment" | undefined =>
  isUnsafeUploadFileType(fileType) ? "attachment" : undefined;

export const createUploadFilePath = ({
  prefix,
  fileType,
}: {
  prefix: string;
  fileType: string;
}): string => `${prefix}/${createUploadFileName(fileType)}`;

export const createUploadSlotFilePath = ({
  prefix,
  fileName,
}: {
  prefix: string;
  fileName: string;
}): string => `${prefix}/${parseUploadPathSegment(fileName)}`;

export const createUploadFileName = (fileType: string): string => {
  const extension =
    extensionFromMimeType[fileType] ?? fallbackUploadFileExtension;

  return `${createId()}.${extension}`;
};

export const parseUploadPathSegment = (pathSegment: string): string => {
  const trimmedPathSegment = pathSegment.trim();

  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(trimmedPathSegment) ||
    trimmedPathSegment === "." ||
    trimmedPathSegment === ".."
  )
    throw new Error("Invalid upload path segment");

  return trimmedPathSegment;
};
