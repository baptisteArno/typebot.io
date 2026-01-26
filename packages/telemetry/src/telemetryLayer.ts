import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { env } from "@typebot.io/env";
import { Effect, Layer } from "effect";

export const TelemetryLayer = Layer.unwrapEffect(
  Effect.sync(() => {
    const endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (!endpoint) return Layer.empty;

    const headers = parseOtlpHeaders(env.OTEL_EXPORTER_OTLP_HEADERS);

    return NodeSdk.layer(() => ({
      resource: { serviceName: "builder" },
      spanProcessor: new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: `${endpoint}/v1/traces`,
          headers,
        }),
      ),
    }));
  }),
);

const parseOtlpHeaders = (
  headersEnv: string | undefined,
): Record<string, string> => {
  if (!headersEnv) return {};

  const headers: Record<string, string> = {};
  for (const pair of headersEnv.split(",")) {
    const delimiterIndex = pair.indexOf("=");
    if (delimiterIndex === -1) continue;
    const key = pair.slice(0, delimiterIndex).trim();
    const value = pair.slice(delimiterIndex + 1).trim();
    if (key) headers[key] = value;
  }
  return headers;
};
