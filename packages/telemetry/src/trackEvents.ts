import { env } from "@typebot.io/env";
import { PostHog } from "posthog-node";
import type { TelemetryEvent } from "./schemas";

export const trackEvents = async (events: TelemetryEvent[]) => {
  if (!env.NEXT_PUBLIC_POSTHOG_KEY) return;
  const client = new PostHog(env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: env.POSTHOG_API_HOST,
    // Large thresholds since we explicitly shutdown right after.
    flushAt: 100_000,
    flushInterval: 120_000,
  });

  for (const event of events) {
    if (event.name === "Workspace created") {
      client.groupIdentify({
        distinctId: event.userId,
        groupType: "workspace",
        groupKey: event.workspaceId,
      });
      continue;
    }
    if (event.name === "Typebot created") {
      client.groupIdentify({
        distinctId: event.userId,
        groupType: "typebot",
        groupKey: event.typebotId,
      });
      continue;
    }
    const groups: { workspace?: string; typebot?: string } = {};
    if ("workspaceId" in event) groups["workspace"] = event.workspaceId;
    if ("typebotId" in event) groups["typebot"] = event.typebotId;
    client.capture({
      distinctId: "userId" in event ? event.userId : event.visitorId,
      event: event.name,
      properties: "data" in event ? event.data : undefined,
      ...(Object.keys(groups).length ? { groups } : {}),
    });
  }

  try {
    await client.shutdown();
  } catch (err) {
    console.error("ERROR while shutting down PostHog client", err);
  }
};
