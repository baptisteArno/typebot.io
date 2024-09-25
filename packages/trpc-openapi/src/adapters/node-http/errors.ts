import { TRPCError } from "@trpc/server";

export const TRPC_ERROR_CODE_HTTP_STATUS: Record<TRPCError["code"], number> = {
  PARSE_ERROR: 400,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  TIMEOUT: 408,
  CONFLICT: 409,
  CLIENT_CLOSED_REQUEST: 499,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  METHOD_NOT_SUPPORTED: 405,
  TOO_MANY_REQUESTS: 429,
  UNPROCESSABLE_CONTENT: 422,
  NOT_IMPLEMENTED: 501,
};

export const HTTP_STATUS_TRPC_ERROR_CODE: Record<number, TRPCError["code"]> = {
  400: "BAD_REQUEST",
  404: "NOT_FOUND",
  500: "INTERNAL_SERVER_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  408: "TIMEOUT",
  409: "CONFLICT",
  499: "CLIENT_CLOSED_REQUEST",
  412: "PRECONDITION_FAILED",
  413: "PAYLOAD_TOO_LARGE",
  405: "METHOD_NOT_SUPPORTED",
  429: "TOO_MANY_REQUESTS",
  422: "UNPROCESSABLE_CONTENT",
  501: "NOT_IMPLEMENTED",
};

export const TRPC_ERROR_CODE_MESSAGE: Record<TRPCError["code"], string> = {
  PARSE_ERROR: "Parse error",
  BAD_REQUEST: "Bad request",
  NOT_FOUND: "Not found",
  INTERNAL_SERVER_ERROR: "Internal server error",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  TIMEOUT: "Timeout",
  CONFLICT: "Conflict",
  CLIENT_CLOSED_REQUEST: "Client closed request",
  PRECONDITION_FAILED: "Precondition failed",
  PAYLOAD_TOO_LARGE: "Payload too large",
  METHOD_NOT_SUPPORTED: "Method not supported",
  TOO_MANY_REQUESTS: "Too many requests",
  UNPROCESSABLE_CONTENT: "Unprocessable content",
  NOT_IMPLEMENTED: "Not implemented",
};

export function getErrorFromUnknown(cause: unknown): TRPCError {
  if (cause instanceof Error && cause.name === "TRPCError") {
    return cause as TRPCError;
  }

  let errorCause: Error | undefined = undefined;
  let stack: string | undefined = undefined;

  if (cause instanceof Error) {
    errorCause = cause;
    stack = cause.stack;
  }

  const error = new TRPCError({
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    cause: errorCause,
  });

  if (stack) {
    error.stack = stack;
  }

  return error;
}
