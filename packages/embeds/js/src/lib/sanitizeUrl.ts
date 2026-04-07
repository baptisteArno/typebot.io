const allowedProtocols = ["https:", "http:", "mailto:", "tel:"];

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url, "https://placeholder.com");
    if (allowedProtocols.includes(parsed.protocol)) return url;
    return "#";
  } catch {
    return url;
  }
};
