import { NodeSdk } from "@effect/opentelemetry";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect, Layer } from "effect";
import { getOtlpConfig, isOtlpSignalEnabled } from "./getOtlpConfig";

export const createTelemetryLayer = (serviceName: string) =>
  Layer.unwrap(
    Effect.sync(() => {
      const otlpConfig = getOtlpConfig();
      if (!otlpConfig) return Layer.empty;

      const spanProcessor = isOtlpSignalEnabled(otlpConfig, "traces")
        ? new BatchSpanProcessor(
            new OTLPTraceExporter({
              headers: otlpConfig.headers,
              url: otlpConfig.tracesUrl,
            }),
          )
        : undefined;
      const logRecordProcessor = isOtlpSignalEnabled(otlpConfig, "logs")
        ? new BatchLogRecordProcessor(
            new OTLPLogExporter({
              headers: otlpConfig.headers,
              url: otlpConfig.logsUrl,
            }),
          )
        : undefined;

      return NodeSdk.layer(() => ({
        resource: { serviceName },
        ...(spanProcessor ? { spanProcessor } : {}),
        ...(logRecordProcessor
          ? {
              logRecordProcessor,
              loggerMergeWithExisting: true,
            }
          : {}),
      }));
    }),
  );
