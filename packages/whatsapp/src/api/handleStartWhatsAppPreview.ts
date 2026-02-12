import { ORPCError } from "@orpc/server";
import { saveStateToDatabase } from "@typebot.io/bot-engine/saveStateToDatabase";
import { startSession } from "@typebot.io/bot-engine/startSession";
import { startFromSchema } from "@typebot.io/chat-api/schemas";
import { restartSession } from "@typebot.io/chat-session/queries/restartSession";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import { createToastORPCError } from "@typebot.io/lib/createToastORPCError";
import prisma from "@typebot.io/prisma";
import { withSessionStore } from "@typebot.io/runtime-session-store";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import type { User } from "@typebot.io/user/schemas";
import { sendChatReplyToWhatsApp } from "@typebot.io/whatsapp/sendChatReplyToWhatsApp";
import { sendWhatsAppMessage } from "@typebot.io/whatsapp/sendWhatsAppMessage";
import { z } from "zod";

export const startWhatsAppPreviewInputSchema = z.object({
  to: z
    .string()
    .min(1)
    .transform((value) =>
      value.replace(/\s/g, "").replace(/\+/g, "").replace(/-/g, ""),
    ),
  typebotId: z.string(),
  startFrom: startFromSchema.optional(),
});

export const handleStartWhatsAppPreview = async ({
  input: { to, typebotId, startFrom },
  context: { user },
}: {
  input: z.infer<typeof startWhatsAppPreviewInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  if (
    !env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID ||
    !env.META_SYSTEM_USER_TOKEN ||
    !env.WHATSAPP_PREVIEW_TEMPLATE_NAME
  )
    throw new ORPCError("BAD_REQUEST", {
      message:
        "Missing WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID or META_SYSTEM_USER_TOKEN or WHATSAPP_PREVIEW_TEMPLATE_NAME env variables",
    });

  const existingTypebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    select: {
      id: true,
      workspace: {
        select: {
          isSuspended: true,
          isPastDue: true,
          members: {
            select: {
              userId: true,
            },
          },
        },
      },
      collaborators: {
        select: {
          userId: true,
        },
      },
    },
  });
  if (
    !existingTypebot?.id ||
    (await isReadTypebotForbidden(existingTypebot, user))
  )
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const sessionId = `wa-preview-${to}`;

  const existingSession = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
    },
    select: {
      updatedAt: true,
      state: true,
    },
  });

  const canSendDirectMessagesToUser =
    (existingSession?.updatedAt.getTime() ?? 0) >
    Date.now() - 24 * 60 * 60 * 1000;

  return withSessionStore(sessionId, async (sessionStore) => {
    const {
      newSessionState,
      messages,
      input,
      clientSideActions,
      logs,
      visitedEdges,
      setVariableHistory,
    } = await startSession({
      version: 2,
      sessionStore,
      startParams: {
        isOnlyRegistering: !canSendDirectMessagesToUser,
        type: "preview",
        typebotId,
        startFrom,
        userId: user.id,
        isStreamEnabled: false,
        textBubbleContentFormat: "richText",
      },
      initialSessionState: {
        whatsApp: (existingSession?.state as SessionState | undefined)
          ?.whatsApp,
      },
    });

    try {
      if (canSendDirectMessagesToUser) {
        await sendChatReplyToWhatsApp({
          to,
          messages,
          input,
          clientSideActions,
          isFirstChatChunk: true,
          credentials: {
            provider: "meta",
            phoneNumberId: env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID!,
            systemUserAccessToken: env.META_SYSTEM_USER_TOKEN!,
          },
          state: newSessionState,
        });
        await saveStateToDatabase({
          clientSideActions: [],
          input,
          logs,
          sessionId: {
            type: "existing",
            id: sessionId,
          },
          session: {
            state: newSessionState,
          },
          visitedEdges,
          setVariableHistory,
        });

        return {
          message: "Sent direct WA message",
        };
      } else {
        await restartSession({
          state: newSessionState,
          id: sessionId,
        });

        await sendWhatsAppMessage({
          to,
          message: {
            type: "template",
            template: {
              language: {
                code: env.WHATSAPP_PREVIEW_TEMPLATE_LANG,
              },
              name: env.WHATSAPP_PREVIEW_TEMPLATE_NAME!,
            },
          },
          credentials: {
            provider: "meta",
            phoneNumberId: env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID!,
            systemUserAccessToken: env.META_SYSTEM_USER_TOKEN!,
          },
        });
        return {
          message: "Sent WA template",
        };
      }
    } catch (error) {
      throw await createToastORPCError(error);
    }
  });
};
