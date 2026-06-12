import * as p from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { defaultWhatsAppWebhookForwardingScope } from "@typebot.io/settings/constants";
import { settingsSchema } from "@typebot.io/settings/schemas";
import { promptAndSetEnvironment } from "./utils";

const updateWhatsAppStatusForwardUrl = async () => {
  await promptAndSetEnvironment("production");

  const typebotId = await p.text({ message: "Typebot ID?" });
  if (!typebotId || p.isCancel(typebotId)) process.exit();

  const newUrl = await p.text({
    message: "New forward URL?",
    validate: (value) => {
      try {
        new URL(value);
      } catch {
        return "Invalid URL";
      }
    },
  });
  if (!newUrl || p.isCancel(newUrl)) process.exit();

  const typebot = await prisma.typebot.findUnique({
    where: { id: typebotId },
    select: {
      id: true,
      name: true,
      settings: true,
      publishedTypebot: { select: { id: true, settings: true } },
    },
  });

  if (!typebot) {
    console.log("Typebot not found");
    return;
  }

  const draftSettings = settingsSchema.parse(typebot.settings);
  const publishedSettings = typebot.publishedTypebot
    ? settingsSchema.parse(typebot.publishedTypebot.settings)
    : null;

  console.log({
    name: typebot.name,
    currentDraftUrl:
      draftSettings.whatsApp?.webhookForwarding?.url ??
      draftSettings.whatsApp?.errorAndMarketingStatusWebhookForwardUrl,
    currentPublishedUrl:
      publishedSettings?.whatsApp?.webhookForwarding?.url ??
      publishedSettings?.whatsApp?.errorAndMarketingStatusWebhookForwardUrl,
    newUrl,
  });

  const shouldProceed = await p.confirm({ message: "Apply update?" });
  if (!shouldProceed || p.isCancel(shouldProceed)) process.exit();

  await prisma.typebot.update({
    where: { id: typebotId },
    data: {
      settings: {
        ...draftSettings,
        whatsApp: {
          ...draftSettings.whatsApp,
          errorAndMarketingStatusWebhookForwardUrl: undefined,
          webhookForwarding: {
            ...draftSettings.whatsApp?.webhookForwarding,
            url: newUrl,
            scope:
              draftSettings.whatsApp?.webhookForwarding?.scope ??
              defaultWhatsAppWebhookForwardingScope,
          },
        },
      },
    },
  });

  if (publishedSettings && typebot.publishedTypebot) {
    await prisma.publicTypebot.update({
      where: { id: typebot.publishedTypebot.id },
      data: {
        settings: {
          ...publishedSettings,
          whatsApp: {
            ...publishedSettings.whatsApp,
            errorAndMarketingStatusWebhookForwardUrl: undefined,
            webhookForwarding: {
              ...publishedSettings.whatsApp?.webhookForwarding,
              url: newUrl,
              scope:
                publishedSettings.whatsApp?.webhookForwarding?.scope ??
                defaultWhatsAppWebhookForwardingScope,
            },
          },
        },
      },
    });
  }

  console.log("Done.");
};

updateWhatsAppStatusForwardUrl();
