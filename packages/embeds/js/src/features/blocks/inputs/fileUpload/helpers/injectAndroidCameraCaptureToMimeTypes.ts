/**
 * Adds Android camera workaround to file types to ensure camera option appears on Android devices.
 * This addresses an issue in Android 14+ where the camera option doesn't appear for image/* accept types.
 */
export const injectAndroidCameraCaptureToMimeTypes = (
  types?: string[],
): string => {
  if (!types || types.length === 0) return "";

  const typesString = types.join(", ");

  const hasImageTypes = types.some(
    (type) => type.startsWith("image/") || type === "image/*",
  );

  if (hasImageTypes) {
    return `${typesString}, capture=camera`;
  }

  return typesString;
};
