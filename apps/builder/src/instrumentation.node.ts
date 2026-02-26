import { SpanStatusCode } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  type ReadableSpan,
  SimpleSpanProcessor,
  type SpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const expectedORPCErrorCodes = new Set([
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "TIMEOUT",
  "CONFLICT",
]);

const isExpectedORPCExceptionEvent = (
  event: ReadableSpan["events"][number],
) => {
  if (event.name !== "exception") return false;
  const orpcCode = event.attributes?.["exception.type"]?.toString();
  if (!orpcCode) return false;
  return expectedORPCErrorCodes.has(orpcCode);
};

const shouldIgnoreSpanError = (span: ReadableSpan) => {
  if (span.status.code !== SpanStatusCode.ERROR) return false;
  const exceptionEvents = span.events.filter(
    (event) => event.name === "exception",
  );
  if (exceptionEvents.length === 0) return false;
  return exceptionEvents.every(isExpectedORPCExceptionEvent);
};

const baseSpanProcessor = new SimpleSpanProcessor(new OTLPTraceExporter());

const spanProcessor = {
  onStart: (span, context) => baseSpanProcessor.onStart(span, context),
  onEnding(span) {
    if (!shouldIgnoreSpanError(span)) return;

    span.setStatus({
      ...span.status,
      code: SpanStatusCode.UNSET,
    });
  },
  onEnd: (span) => baseSpanProcessor.onEnd(span),
  shutdown: () => baseSpanProcessor.shutdown(),
  forceFlush: () => baseSpanProcessor.forceFlush(),
} satisfies SpanProcessor;

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "builder",
  }),
  spanProcessor,
});

sdk.start();
