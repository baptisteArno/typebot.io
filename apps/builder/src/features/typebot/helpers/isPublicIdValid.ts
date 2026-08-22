export const PUBLIC_ID_MAX_LENGTH = 255;

export const isPublicIdValid = (publicId: string) =>
  publicId.length <= PUBLIC_ID_MAX_LENGTH &&
  /^[a-z0-9-]*$/.test(publicId) &&
  !publicId.startsWith("-") &&
  !publicId.includes("--");
