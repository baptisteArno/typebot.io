import * as OtelLogger from "@effect/opentelemetry/Logger";
import * as Resource from "@effect/opentelemetry/Resource";
import * as OtelTracer from "@effect/opentelemetry/Tracer";
import { logs } from "@opentelemetry/api-logs";
import type { LoggerProvider } from "@opentelemetry/sdk-logs";
import { Layer } from "effect";
import { getOtlpConfig, isOtlpSignalEnabled } from "./getOtlpConfig";

const GlobalLoggerProviderLayer = Layer.sync(
  OtelLogger.OtelLoggerProvider,
  () => logs.getLoggerProvider() as LoggerProvider,
);

export const createGlobalTelemetryLayer = (serviceName: string) => {
  const otlpConfig = getOtlpConfig();
  if (!otlpConfig) return Layer.empty;

  const tracerLayer = isOtlpSignalEnabled(otlpConfig, "traces")
    ? OtelTracer.layerGlobal.pipe(
        Layer.provideMerge(
          Resource.layer({
            serviceName,
          }),
        ),
      )
    : Layer.empty;

  const loggerLayer = isOtlpSignalEnabled(otlpConfig, "logs")
    ? OtelLogger.layer({
        mergeWithExisting: true,
      }).pipe(Layer.provide(GlobalLoggerProviderLayer))
    : Layer.empty;

  return Layer.mergeAll(tracerLayer, loggerLayer);
};
