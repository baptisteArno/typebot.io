import { createHash, randomBytes } from "node:crypto";

export const generateApiToken = () => randomBytes(32).toString("base64url");

export const hashApiToken = (apiToken: string) =>
  createHash("sha256").update(apiToken).digest("hex");

export const isHashedApiToken = (apiToken: string) =>
  /^[0-9a-f]{64}$/.test(apiToken);
