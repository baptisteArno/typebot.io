import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";

export const handler = createAPIFileRoute("/api/healthz")({
  GET: () => json({ status: "ok", timestamp: new Date().toISOString() }),
});
