export const isSameOriginRequest = (headers: Headers, builderUrl: string) => {
  const site = headers.get("sec-fetch-site");
  // SameSite cookies also accompany requests from untrusted sibling subdomains.
  // Fetch Metadata cannot be overridden by scripts, including across redirects.
  if (site && site !== "same-origin") return false;
  const origin = headers.get("origin");
  if (origin) return origin === new URL(builderUrl).origin;
  if (site === "same-origin") return true;

  // Older browsers may omit Fetch Metadata. Require positive origin evidence;
  // referrer-policy:no-referrer must not turn a request into an authenticated one.
  const referer = headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === new URL(builderUrl).origin;
  } catch {
    return false;
  }
};
