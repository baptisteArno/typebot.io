import { env } from "@typebot.io/env";

export type OtlpSignal = "traces" | "logs" | "both";
export type OtlpSignalName = "traces" | "logs";

export type OtlpConfig = {
  endpoint: string;
  headers: Record<string, string>;
  signals: OtlpSignal;
  logsUrl: string;
  tracesUrl: string;
};

export const getOtlpConfig = (): OtlpConfig | undefined => {
  const endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) return;

  const normalizedEndpoint = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;

  return {
    endpoint,
    headers: parseOtlpHeaders(env.OTEL_EXPORTER_OTLP_HEADERS),
    signals: env.OTEL_EXPORTER_OTLP_SIGNALS,
    logsUrl: new URL("v1/logs", normalizedEndpoint).toString(),
    tracesUrl: new URL("v1/traces", normalizedEndpoint).toString(),
  };
};

export const isOtlpSignalEnabled = (
  otlpConfig: OtlpConfig,
  signal: OtlpSignalName,
) =>
  otlpConfig.signals === "both" ||
  (signal === "traces" && otlpConfig.signals === "traces") ||
  (signal === "logs" && otlpConfig.signals === "logs");

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
