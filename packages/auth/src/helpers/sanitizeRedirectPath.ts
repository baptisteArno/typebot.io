export const sanitizeRedirectPath = (
  redirectPath: string | null | undefined,
): string | null => {
  // Accept only root-relative paths, never a scheme or an authority. Query
  // parameters have already been decoded by the caller; do not decode again.
  if (!redirectPath?.startsWith("/") || redirectPath.startsWith("//"))
    return null;
  // biome-ignore lint/suspicious/noControlCharactersInRegex: URL parsers strip controls and can expose an authority.
  if (/[\\\u0000-\u001f\u007f]/.test(redirectPath)) return null;

  try {
    const url = new URL(redirectPath, "https://redirect.invalid");
    if (
      url.origin !== "https://redirect.invalid" ||
      // Dot-segment normalization can turn /a/..//host into //host.
      url.pathname.startsWith("//")
    )
      return null;
    return url.pathname + url.search + url.hash;
  } catch {
    return null;
  }
};
