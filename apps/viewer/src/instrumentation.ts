import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    const { registerNodeTelemetry } = await import(
      "@typebot.io/telemetry/registerNodeTelemetry"
    );
    registerNodeTelemetry("viewer");
  }
}
export const onRequestError = Sentry.captureRequestError;
