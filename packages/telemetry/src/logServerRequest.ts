import { logs, SeverityNumber } from "@opentelemetry/api-logs";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";

type RequestLogMetadata = {
  request: Request;
  response?: Response;
  startedAt: number;
  error?: unknown;
};

const logger = logs.getLogger("@typebot.io/telemetry/request");

export const logServerRequest = async ({
  request,
  response,
  startedAt,
  error,
}: RequestLogMetadata) => {
  const requestUrl = new URL(request.url);
  const statusCode = response?.status ?? 500;
  const durationMs = Date.now() - startedAt;
  const parsedError = error
    ? await parseUnknownError({
        context: `${request.method} ${requestUrl.pathname}`,
        err: error,
      })
    : undefined;

  logger.emit({
    attributes: {
      "http.method": request.method,
      "http.response.status_code": statusCode,
      "url.path": requestUrl.pathname,
      ...(parsedError
        ? {
            "error.message": parsedError.description,
            ...(parsedError.details
              ? { "error.details": parsedError.details }
              : {}),
          }
        : {}),
    },
    body: `${request.method} ${requestUrl.pathname} ${statusCode} ${durationMs}ms`,
    severityNumber: getSeverityNumber(statusCode),
    severityText: getSeverityText(statusCode),
  });
};

const getSeverityNumber = (statusCode: number) => {
  if (statusCode >= 500) return SeverityNumber.ERROR;
  if (statusCode >= 400) return SeverityNumber.WARN;
  return SeverityNumber.INFO;
};

const getSeverityText = (statusCode: number) => {
  if (statusCode >= 500) return "ERROR";
  if (statusCode >= 400) return "WARN";
  return "INFO";
};
