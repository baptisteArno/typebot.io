import { ORPCError } from "@orpc/server";
import { parseUnknownError } from "./parseUnknownError";
import type { ToastErrorData } from "./toastErrorData";

export const createToastORPCError = async (err: unknown, context?: string) => {
  const parsed = await parseUnknownError({ err, context });
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: parsed.description,
    data: {
      context: parsed.context,
      details: parsed.details,
    } satisfies ToastErrorData,
  });
};
