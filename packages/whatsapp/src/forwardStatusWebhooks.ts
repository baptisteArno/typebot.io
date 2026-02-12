import * as Sentry from "@sentry/nextjs";
import { ky } from "@typebot.io/lib/ky";
import prisma from "@typebot.io/prisma";
import { settingsSchema } from "@typebot.io/settings/schemas";
import type { WhatsAppWebhookRequestBody } from "./schemas";

type Props = {
  entry: WhatsAppWebhookRequestBody["entry"];
  workspaceId: string;
  credentialsId: string;
};

type IncomingChange =
  WhatsAppWebhookRequestBody["entry"][number]["changes"][number];
type IncomingStatus = NonNullable<IncomingChange["value"]["statuses"]>[number];
type StatusWebhookPayload = Pick<WhatsAppWebhookRequestBody, "entry">;

type StatusRouteMatch = {
  entryIndex: number;
  changeIndex: number;
  status: IncomingStatus;
};

export const forwardStatusWebhooks = async ({
  entry,
  workspaceId,
  credentialsId,
}: Props) => {
  try {
    const statusesToForward: StatusRouteMatch[] = [];

    for (const [entryIndex, webhookEntry] of entry.entries()) {
      for (const [changeIndex, change] of webhookEntry.changes.entries()) {
        for (const status of change.value.statuses ?? []) {
          if (!shouldForwardStatus(status)) continue;

          statusesToForward.push({
            entryIndex,
            changeIndex,
            status,
          });
        }
      }
    }

    if (statusesToForward.length === 0) return;

    console.log(`Extracted ${statusesToForward.length} statuses to forward`);

    const forwardingUrls = await getForwardingUrls({
      workspaceId,
      credentialsId,
    });

    console.log(`Extracted ${forwardingUrls.length} forwarding URLs`);
    if (forwardingUrls.length === 0) return;

    const payload = buildFilteredStatusPayload({
      entry,
      matchedStatuses: statusesToForward,
    });

    console.log(`Built payload with ${payload.entry.length} entries`);
    if (payload.entry.length === 0) return;

    for (const url of forwardingUrls) {
      try {
        await ky.post(url, {
          json: payload,
        });
        console.log(`Forwarded status to ${url}`);
      } catch (error) {
        console.warn("Failed to forward WhatsApp statuses", { url, error });
        Sentry.captureException(error, {
          extra: {
            url,
            source: "whatsapp-status-forwarding",
          },
        });
      }
    }
  } catch (error) {
    console.warn("Unexpected error while forwarding WhatsApp statuses", error);
    Sentry.captureException(error, {
      extra: {
        source: "whatsapp-status-forwarding",
      },
    });
  }
};

const getForwardingUrls = async ({
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

  const uniqueUrls = new Set<string>();

  for (const publicTypebot of potentialPublicTypebots) {
    const parsedSettings = settingsSchema.safeParse(publicTypebot.settings);
    if (
      !parsedSettings.success ||
      parsedSettings.data.whatsApp?.isEnabled !== true
    )
      continue;

    const forwardingUrl =
      parsedSettings.data.whatsApp.errorAndMarketingStatusWebhookForwardUrl;
    if (forwardingUrl) uniqueUrls.add(forwardingUrl);
  }

  return Array.from(uniqueUrls);
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

const shouldForwardStatus = (status: IncomingStatus) => {
  if ((status.errors?.length ?? 0) > 0) return true;
  const originType = status.conversation?.origin?.type;
  return originType === "marketing" || originType === "marketing_lite";
};
