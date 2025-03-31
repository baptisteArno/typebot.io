export const extensionFromMimeType: { [key: string]: string } = {
  "audio/aac": "aac",
  "audio/mp3": "mp3",
  "audio/mp4": "m4a",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/wave": "wav",
  "audio/webm": "weba",
  "image/avif": "avif",
  "image/bmp": "bmp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/svg+xml": "svg",
  "image/tiff": "tif",
  "image/webp": "webp",
  "image/wmf": "wmf",
  "video/mp4": "mp4",
  "video/mpeg": "mpeg",
  "video/ogg": "ogv",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "application/zip": "zip",
  "application/x-rar-compressed": "rar",
  "application/x-7z-compressed": "7z",
  "application/json": "json",
  "application/xml": "xml",
  "application/javascript": "js",
  "application/x-tar": "tar",
  "application/gzip": "gz",
  "application/vnd.android.package-archive": "apk",
  "application/x-executable": "exe",
  "application/vnd.apple.installer+xml": "mpkg",
  "application/rtf": "rtf",
  "application/x-sh": "sh",
  "application/x-font-ttf": "ttf",
  "application/vnd.oasis.opendocument.text": "odt",
  "application/vnd.oasis.opendocument.spreadsheet": "ods",
  "application/vnd.oasis.opendocument.presentation": "odp",
};

export const parseAllowedFileTypesMetadata = (
  allowedFileTypes: string[],
): {
  mimeType: string;
  extension: string;
}[] => {
  const wildcardExtensions = allowedFileTypes
    .filter((ext) => ext.includes("*"))
    .map((ext) => ext.split("/")[0]);

  return Object.entries(extensionFromMimeType)
    .filter(([mimeType, extension]) => {
      const mimeBaseType = mimeType.split("/")[0];
      return (
        allowedFileTypes.some((fileType) => fileType.includes(extension)) ||
        wildcardExtensions.includes(mimeBaseType)
      );
    })
    .map(([mimeType, extension]) => ({ mimeType, extension }));
};
