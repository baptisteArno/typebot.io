import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/healthz").methods({
  GET: async () => {
    return new Response(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  },
});
