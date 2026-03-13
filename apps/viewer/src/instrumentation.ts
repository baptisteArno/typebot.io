import * as Sentry from "@sentry/nextjs";
import { registerNodeTelemetry } from "@typebot.io/telemetry/registerNodeTelemetry";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    registerNodeTelemetry("viewer");
  }
}
export const onRequestError = Sentry.captureRequestError;
