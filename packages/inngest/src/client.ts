import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { env } from "@typebot.io/env";
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "typebot",
  eventKey: env.INNGEST_EVENT_KEY,
  signingKey: env.INNGEST_SIGNING_KEY,
  middleware: [realtimeMiddleware()],
});
