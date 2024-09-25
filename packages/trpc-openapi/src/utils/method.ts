import type { OpenApiMethod } from "../types";

export const acceptsRequestBody = (method: OpenApiMethod) => {
  if (method === "GET" || method === "DELETE") {
    return false;
  }
  return true;
};
