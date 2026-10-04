export const isAllowedHostStudioOrigin = (
  value: string,
  nodeEnv = process.env.NODE_ENV,
) => {
  try {
    const url = new URL(value);
    const isHttps = url.protocol === "https:";
    const isDevelopmentLocalhost =
      nodeEnv === "development" &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

    return (
      (isHttps || isDevelopmentLocalhost) &&
      !url.hostname.includes("*") &&
      url.origin === value &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
};
