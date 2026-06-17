import * as Sentry from "@sentry/nextjs";
import { safeKy } from "@typebot.io/lib/ky";
import prisma from "@typebot.io/prisma";
import {
  settingsSchema,
  type WhatsAppWebhookForwardingEventType,
} from "@typebot.io/settings/schemas";
import type { WhatsAppWebhookRequestBody } from "./schemas";

type Props = {
  entry: WhatsAppWebhookRequestBody["entry"];
  rawPayload: Record<string, unknown>;
  workspaceId: string;
  credentialsId: string;
};

type IncomingChange =
  WhatsAppWebhookRequestBody["entry"][number]["changes"][number];
type IncomingStatus = NonNullable<IncomingChange["value"]["statuses"]>[number];
type StatusWebhookPayload = Pick<WhatsAppWebhookRequestBody, "entry">;
type WebhookForwardingEventType = WhatsAppWebhookForwardingEventType;

type StatusRouteMatch = {
  entryIndex: number;
  changeIndex: number;
  status: IncomingStatus;
};

const defaultWebhookForwardingEventTypes = [
  "errorStatuses",
  "marketingStatuses",
] satisfies WhatsAppWebhookForwardingEventType[];

export const forwardWhatsAppWebhooks = async ({
  entry,
  rawPayload,
  workspaceId,
  credentialsId,
}: Props) => {
  try {
    const forwardingConfigs = await getForwardingConfigs({
      workspaceId,
      credentialsId,
    });

    console.log(`Extracted ${forwardingConfigs.length} forwarding URLs`);
    if (forwardingConfigs.length === 0) return;

    for (const { url, eventTypes } of forwardingConfigs) {
      const payload = buildWhatsAppWebhookForwardingPayload({
        entry,
        rawPayload,
        eventTypes,
      });

      if (!payload) continue;

      try {
        await safeKy.post(url, {
          json: payload,
        });
        console.log(`Forwarded WhatsApp webhook to ${url}`);
      } catch (error) {
        console.warn("Failed to forward WhatsApp webhook", { url, error });
        Sentry.captureException(error, {
          extra: {
            url,
            source: "whatsapp-webhook-forwarding",
          },
        });
      }
    }
  } catch (error) {
    console.warn("Unexpected error while forwarding WhatsApp webhook", error);
    Sentry.captureException(error, {
      extra: {
        source: "whatsapp-webhook-forwarding",
      },
    });
  }
};

const getForwardingConfigs = async ({
  workspaceId,
  credentialsId,
}: {
  workspaceId: string;
  credentialsId: string;
}) => {
  const potentialPublicTypebots = await prisma.publicTypebot.findMany({
    where: {
      typebot: {
        workspaceId,
        whatsAppCredentialsId: credentialsId,
      },
    },
    select: {
      settings: true,
    },
  });

  const forwardingEventTypesByUrl = new Map<
    string,
    Set<WebhookForwardingEventType>
  >();

  for (const publicTypebot of potentialPublicTypebots) {
    const parsedSettings = settingsSchema.safeParse(publicTypebot.settings);
    if (
      !parsedSettings.success ||
      parsedSettings.data.whatsApp?.isEnabled !== true
    )
      continue;

    const forwardingUrl =
      parsedSettings.data.whatsApp.errorAndMarketingStatusWebhookForwardUrl;
    if (!forwardingUrl) continue;
    if (parsedSettings.data.whatsApp.isWebhookForwardingEnabled !== true)
      continue;

    const webhookForwardingEventTypes =
      parsedSettings.data.whatsApp.webhookForwardingEventTypes ??
      defaultWebhookForwardingEventTypes;

    const existingEventTypes = forwardingEventTypesByUrl.get(forwardingUrl);
    if (existingEventTypes) {
      for (const webhookForwardingEventType of webhookForwardingEventTypes) {
        existingEventTypes.add(webhookForwardingEventType);
      }
      continue;
    }
    forwardingEventTypesByUrl.set(
      forwardingUrl,
      new Set(webhookForwardingEventTypes),
    );
  }

  return Array.from(forwardingEventTypesByUrl).map(([url, eventTypes]) => ({
    url,
    eventTypes: Array.from(eventTypes),
  }));
};

export const buildWhatsAppWebhookForwardingPayload = ({
  entry,
  rawPayload,
  eventTypes,
}: {
  entry: WhatsAppWebhookRequestBody["entry"];
  rawPayload: Record<string, unknown>;
  eventTypes: WebhookForwardingEventType[];
}): StatusWebhookPayload | Record<string, unknown> | undefined => {
  if (eventTypes.includes("all")) return rawPayload;

  const matchedStatuses = getMatchedStatuses({ entry, eventTypes });
  if (matchedStatuses.length === 0) return;

  return buildFilteredStatusPayload({
    entry,
    matchedStatuses,
  });
};

const getMatchedStatuses = ({
  entry,
  eventTypes,
}: {
  entry: WhatsAppWebhookRequestBody["entry"];
  eventTypes: WebhookForwardingEventType[];
}) => {
  const matchedStatuses: StatusRouteMatch[] = [];

  for (const [entryIndex, webhookEntry] of entry.entries()) {
    for (const [changeIndex, change] of webhookEntry.changes.entries()) {
      for (const status of change.value.statuses ?? []) {
        if (!shouldForwardStatus({ status, eventTypes })) continue;

        matchedStatuses.push({
          entryIndex,
          changeIndex,
          status,
        });
      }
    }
  }

  return matchedStatuses;
};

const buildFilteredStatusPayload = ({
  entry,
  matchedStatuses,
}: {
  entry: WhatsAppWebhookRequestBody["entry"];
  matchedStatuses: StatusRouteMatch[];
}): StatusWebhookPayload => {
  const statusesByChangeKey = new Map<string, IncomingStatus[]>();

  for (const { entryIndex, changeIndex, status } of matchedStatuses) {
    const changeKey = `${entryIndex}:${changeIndex}`;
    const existingStatuses = statusesByChangeKey.get(changeKey);
    if (existingStatuses) {
      existingStatuses.push(status);
      continue;
    }
    statusesByChangeKey.set(changeKey, [status]);
  }

  return {
    entry: entry.flatMap((webhookEntry, entryIndex) => {
      const filteredChanges = webhookEntry.changes.flatMap(
        (change, changeIndex) => {
          const statuses = statusesByChangeKey.get(
            `${entryIndex}:${changeIndex}`,
          );
          if (!statuses || statuses.length === 0) return [];

          return [
            {
              ...change,
              value: {
                ...change.value,
                statuses,
              },
            },
          ];
        },
      );

      if (filteredChanges.length === 0) return [];

      return [
        {
          ...webhookEntry,
          changes: filteredChanges,
        },
      ];
    }),
  };
};

const shouldForwardStatus = ({
  status,
  eventTypes,
}: {
  status: IncomingStatus;
  eventTypes: WebhookForwardingEventType[];
}) => {
  if (eventTypes.includes("errorStatuses") && isFailedStatus(status))
    return true;
  if (eventTypes.includes("marketingStatuses") && isMarketingStatus(status))
    return true;
  return false;
};

const isFailedStatus = (status: IncomingStatus) =>
  status.status === "failed" || (status.errors?.length ?? 0) > 0;

const isMarketingStatus = (status: IncomingStatus) => {
  const originType = status.conversation?.origin?.type;
  return originType === "marketing" || originType === "marketing_lite";
};
