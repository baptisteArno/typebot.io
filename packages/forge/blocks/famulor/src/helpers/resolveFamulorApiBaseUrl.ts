import { defaultFamulorOrigin, famulorApiPath } from "../constants";

export const resolveFamulorApiBaseUrl = (
  baseUrl: string | undefined,
): { ok: true; apiBaseUrl: string } | { ok: false; message: string } => {
  const raw = baseUrl?.trim() || defaultFamulorOrigin;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return {
      ok: false,
      message: "Famulor base URL must be a valid https URL.",
    };
  }

  if (url.protocol !== "https:")
    return { ok: false, message: "Famulor base URL must use https." };

  if (url.username || url.password || url.search || url.hash)
    return {
      ok: false,
      message:
        "Famulor base URL must be an origin, without credentials or a query.",
    };

  if (url.pathname !== "/" && url.pathname !== "")
    return {
      ok: false,
      message:
        "Famulor base URL must be the host origin. The block appends /api/v1.",
    };

  const hostname = url.hostname.toLowerCase();
  if (hostname === "app.famulor.de" || hostname.endsWith(".famulor.de"))
    return {
      ok: false,
      message:
        "The legacy Famulor host is not supported. Use https://app.famulor.io or a white-label host.",
    };

  return { ok: true, apiBaseUrl: `${url.origin}${famulorApiPath}` };
};
