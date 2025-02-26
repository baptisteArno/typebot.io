import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const handler = createAPIFileRoute("/api/healthz")({
  GET: () => json({ status: "ok", timestamp: new Date().toISOString() }),
});
