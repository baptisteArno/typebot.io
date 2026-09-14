import { ORPCError } from "@orpc/server";

export const serializeWebhookResponse = (body: unknown) => {
  let data = body;
  if (typeof body === "string") {
    try {
      data = JSON.parse(body);
    } catch {
      throw new ORPCError("BAD_REQUEST", {
        message: "Please send a JSON body",
      });
    }
  }
  if (data === null || typeof data !== "object" || Array.isArray(data))
    throw new ORPCError("BAD_REQUEST", {
      message: "Please send a JSON object",
    });
  return JSON.stringify({ data });
};
