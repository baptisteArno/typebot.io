export const createUploadProxyCorsHeaders = (request?: Request) => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PUT, OPTIONS",
  "Access-Control-Allow-Headers":
    request?.headers.get("access-control-request-headers") ??
    "Content-Type, Cache-Control",
  "Access-Control-Max-Age": "86400",
  Vary: "Access-Control-Request-Headers",
});
