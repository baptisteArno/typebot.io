import * as Sentry from "@sentry/nextjs";
import { safeKy } from "@typebot.io/lib/ky";
import prisma from "@typebot.io/prisma";
import {
  defaultWhatsAppWebhookForwardingScope,
  WhatsAppWebhookForwardingScope,
} from "@typebot.io/settings/constants";
import { settingsSchema } from "@typebot.io/settings/schemas";
import type { WhatsAppWebhookRequestBody } from "./schemas";

type Props = {
  entry: WhatsAppWebhookRequestBody["entry"];
  webhookRequestBody: StatusWebhookPayload | Record<string, unknown>;
  workspaceId: string;
  credentialsId: string;
};

type IncomingChange =
  WhatsAppWebhookRequestBody["entry"][number]["changes"][number];
type IncomingStatus = NonNullable<IncomingChange["value"]["statuses"]>[number];
type StatusWebhookPayload = Pick<WhatsAppWebhookRequestBody, "entry">;
type WebhookForwardingPayload = StatusWebhookPayload | Record<string, unknown>;

type ForwardingRoute = {
  url: string;
  scope: WhatsAppWebhookForwardingScope;
};

type StatusRouteMatch = {
  entryIndex: number;
  changeIndex: number;
  status: IncomingStatus;
};

const forwardingScopePriorities: Record<
  WhatsAppWebhookForwardingScope,
  number
> = {
  [WhatsAppWebhookForwardingScope.ERROR_AND_MARKETING_STATUSES]: 0,
  [WhatsAppWebhookForwardingScope.ALL_STATUSES]: 1,
  [WhatsAppWebhookForwardingScope.ALL_EVENTS]: 2,
};

export const forwardStatusWebhooks = async ({
  entry,
  webhookRequestBody,
  workspaceId,
  credentialsId,
}: Props) => {
  try {
    const forwardingRoutes = await getForwardingRoutes({
      workspaceId,
      credentialsId,
    });

    console.log(`Extracted ${forwardingRoutes.length} forwarding URLs`);
    if (forwardingRoutes.length === 0) return;

    for (const { url, scope } of forwardingRoutes) {
      try {
        const payload = buildWebhookForwardingPayload({
          entry,
          webhookRequestBody,
          scope,
        });
        if (!payload) continue;

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

export const buildWebhookForwardingPayload = ({
  entry,
  webhookRequestBody,
  scope,
}: {
  entry: WhatsAppWebhookRequestBody["entry"];
  webhookRequestBody: StatusWebhookPayload | Record<string, unknown>;
  scope: WhatsAppWebhookForwardingScope;
}): WebhookForwardingPayload | undefined => {
  if (scope === WhatsAppWebhookForwardingScope.ALL_EVENTS)
    return webhookRequestBody;

  const statusesToForward = extractStatusesToForward({ entry, scope });
  if (statusesToForward.length === 0) return;

  return buildFilteredStatusPayload({
    entry,
    matchedStatuses: statusesToForward,
  });
};

const extractStatusesToForward = ({
  entry,
  scope,
}: {
  entry: WhatsAppWebhookRequestBody["entry"];
  scope: WhatsAppWebhookForwardingScope;
}) => {
  const statusesToForward: StatusRouteMatch[] = [];

  for (const [entryIndex, webhookEntry] of entry.entries()) {
    for (const [changeIndex, change] of webhookEntry.changes.entries()) {
      for (const status of change.value.statuses ?? []) {
        if (!shouldForwardStatus({ status, scope })) continue;

        statusesToForward.push({
          entryIndex,
          changeIndex,
          status,
        });
      }
    }
  }

  return statusesToForward;
};

const getForwardingRoutes = async ({
  workspaceId,
  credentialsId,
}: {
  workspaceId: string;
  credentialsId: string;
}): Promise<ForwardingRoute[]> => {
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

  return getForwardingRoutesFromPublicTypebots(potentialPublicTypebots);
};

export const getForwardingRoutesFromPublicTypebots = (
  publicTypebots: readonly { settings: unknown }[],
): ForwardingRoute[] => {
  const forwardingScopesByUrl = new Map<
    string,
    WhatsAppWebhookForwardingScope
  >();

  for (const publicTypebot of publicTypebots) {
    const parsedSettings = settingsSchema.safeParse(publicTypebot.settings);
    if (
      !parsedSettings.success ||
      parsedSettings.data.whatsApp?.isEnabled !== true
    )
      continue;

    const forwardingUrl =
      parsedSettings.data.whatsApp.webhookForwarding?.url ??
      parsedSettings.data.whatsApp.errorAndMarketingStatusWebhookForwardUrl;
    if (!forwardingUrl) continue;

    const forwardingScope =
      parsedSettings.data.whatsApp.webhookForwarding?.scope ??
      defaultWhatsAppWebhookForwardingScope;
    forwardingScopesByUrl.set(
      forwardingUrl,
      getMostInclusiveForwardingScope({
        currentScope: forwardingScopesByUrl.get(forwardingUrl),
        nextScope: forwardingScope,
      }),
    );
  }

  return Array.from(forwardingScopesByUrl.entries()).map(([url, scope]) => ({
    url,
    scope,
  }));
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
  scope,
}: {
  status: IncomingStatus;
  scope: WhatsAppWebhookForwardingScope;
}) => {
  if (scope === WhatsAppWebhookForwardingScope.ALL_STATUSES) return true;
  if ((status.errors?.length ?? 0) > 0) return true;
  const originType = status.conversation?.origin?.type;
  return originType === "marketing" || originType === "marketing_lite";
};

const getMostInclusiveForwardingScope = ({
  currentScope,
  nextScope,
}: {
  currentScope: WhatsAppWebhookForwardingScope | undefined;
  nextScope: WhatsAppWebhookForwardingScope;
}) => {
  if (!currentScope) return nextScope;
  return forwardingScopePriorities[nextScope] >
    forwardingScopePriorities[currentScope]
    ? nextScope
    : currentScope;
};
