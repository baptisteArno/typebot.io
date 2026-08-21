import prisma from "@typebot.io/prisma";
import {
  settingsSchema,
  whatsAppWebhookForwardingUrlSchema,
} from "@typebot.io/settings/schemas";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const updateWhatsAppStatusForwardUrl = async () => {
  assertProductionEnvironment();

  const typebotId = await getRequiredInput({
    message: "Typebot ID?",
    name: "typebot-id",
  });

  const newUrl = await getRequiredInput({
    message: "New forward URL?",
    name: "url",
    validate: (value) =>
      whatsAppWebhookForwardingUrlSchema.safeParse(value).success
        ? undefined
        : "Invalid URL",
  });

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
      draftSettings.whatsApp?.errorAndMarketingStatusWebhookForwardUrl,
    currentPublishedUrl:
      publishedSettings?.whatsApp?.errorAndMarketingStatusWebhookForwardUrl,
    newUrl,
  });

  if (!(await confirmAction({ message: "Apply update?" }))) return;

  await prisma.typebot.update({
    where: { id: typebotId },
    data: {
      settings: {
        ...draftSettings,
        whatsApp: {
          ...draftSettings.whatsApp,
          errorAndMarketingStatusWebhookForwardUrl: newUrl,
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
            errorAndMarketingStatusWebhookForwardUrl: newUrl,
          },
        },
      },
    });
  }

  console.log("Done.");
};

runScript(updateWhatsAppStatusForwardUrl);
