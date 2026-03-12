import { logs } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from "@opentelemetry/sdk-logs";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { getOtlpConfig, isOtlpSignalEnabled } from "./getOtlpConfig";

type TelemetryState = {
  loggerProvider?: LoggerProvider;
  shutdownRegistered?: true;
  tracerProvider?: NodeTracerProvider;
};

declare global {
  var __typebotNodeTelemetry: TelemetryState | undefined;
}

export const registerNodeTelemetry = (serviceName: string) => {
  const otlpConfig = getOtlpConfig();
  if (!otlpConfig) return;

  const telemetryState = getTelemetryState();

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: serviceName,
  });

  if (
    isOtlpSignalEnabled(otlpConfig, "traces") &&
    !telemetryState.tracerProvider
  ) {
    const tracerProvider = new NodeTracerProvider({
      resource,
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            headers: otlpConfig.headers,
            url: otlpConfig.tracesUrl,
          }),
        ),
      ],
    });

    tracerProvider.register();
    telemetryState.tracerProvider = tracerProvider;
  }

  if (
    isOtlpSignalEnabled(otlpConfig, "logs") &&
    !telemetryState.loggerProvider
  ) {
    const loggerProvider = new LoggerProvider({
      processors: [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            headers: otlpConfig.headers,
            url: otlpConfig.logsUrl,
          }),
        ),
      ],
      resource,
    });

    logs.setGlobalLoggerProvider(loggerProvider);
    telemetryState.loggerProvider = loggerProvider;
  }

  if (!telemetryState.shutdownRegistered) {
    registerShutdown();
    telemetryState.shutdownRegistered = true;
  }
};

const getTelemetryState = () => {
  if (!globalThis.__typebotNodeTelemetry) {
    globalThis.__typebotNodeTelemetry = {};
  }

  return globalThis.__typebotNodeTelemetry;
};

const registerShutdown = () => {
  const shutdown = () => {
    const telemetryState = getTelemetryState();
    const shutdownPromises = [
      telemetryState.tracerProvider?.shutdown(),
      telemetryState.loggerProvider?.shutdown(),
    ].filter((promise) => promise !== undefined);
    if (shutdownPromises.length === 0) return;

    void Promise.all(shutdownPromises).catch(() => undefined);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  process.once("beforeExit", shutdown);
};
