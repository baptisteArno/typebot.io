type ResolveUploadProxyBaseUrlProps = {
  publicBaseUrls: string[];
  fallbackBaseUrl: string;
  requestOrigin?: string;
};

export const resolveUploadProxyBaseUrl = ({
  publicBaseUrls,
  fallbackBaseUrl,
  requestOrigin,
}: ResolveUploadProxyBaseUrlProps) =>
  (requestOrigin
    ? publicBaseUrls.find(
        (publicBaseUrl) => parseOrigin(publicBaseUrl) === requestOrigin,
      )
    : undefined) ??
  publicBaseUrls[0] ??
  fallbackBaseUrl;

const parseOrigin = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return;
  }
};
