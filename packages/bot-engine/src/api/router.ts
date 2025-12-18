import {
  continueChatResponseSchema,
  startChatResponseSchema,
  startPreviewChatResponseSchema,
} from "@typebot.io/chat-api/schemas";
import {
  procedureWithOptionalUser,
  protectedProcedure,
  publicProcedure,
} from "@typebot.io/config/orpc/viewer/middlewares";
import { z } from "@typebot.io/zod";
import {
  chatReplySchema,
  sendMessageInputSchema,
} from "../schemas/legacy/schema";
import {
  continueChatInputSchema,
  handleContinueChat,
} from "./handleContinueChat";
import {
  handleSaveClientLogs,
  saveClientLogsInputSchema,
} from "./handleSaveClientLogs";
import { handleStartChat, startChatInputSchema } from "./handleStartChat";
import {
  handleStartChatPreview,
  startPreviewChatInputSchema,
} from "./handleStartChatPreview";
import {
  handleUpdateTypebotInSession,
  updateTypebotInSessionInputSchema,
} from "./handleUpdateTypebotInSession";
import {
  handleSaveClientLogsV1,
  saveClientLogsV1InputSchema,
} from "./legacy/handleSaveClientLogsV1";
import { handleSendMessageV1 } from "./legacy/handleSendMessageV1";
import { handleSendMessageV2 } from "./legacy/handleSendMessageV2";

export const publicChatRouter = {
  startChatProcedure: publicProcedure
    .route({
      method: "POST",
      path: "/v1/typebots/{publicId}/startChat",
      summary: "Start chat",
      tags: ["Chat"],
    })
    .input(startChatInputSchema)
    .output(startChatResponseSchema)
    .handler(handleStartChat),
  continueChatProcedure: publicProcedure
    .route({
      method: "POST",
      path: "/v1/sessions/{sessionId}/continueChat",
      summary: "Continue chat",
      tags: ["Chat"],
    })
    .input(continueChatInputSchema)
    .output(continueChatResponseSchema)
    .handler(handleContinueChat),
  saveClientLogsProcedure: publicProcedure
    .route({
      method: "POST",
      path: "/v2/sessions/{sessionId}/clientLogs",
      summary: "Save logs",
      tags: ["Chat"],
    })
    .input(saveClientLogsInputSchema)
    .output(z.object({ message: z.string() }))
    .handler(handleSaveClientLogs),
  startChatPreviewProcedure: procedureWithOptionalUser
    .route({
      method: "POST",
      path: "/v1/typebots/{typebotId}/preview/startChat",
      summary: "Start preview chat",
      description:
        'Use this endpoint to test your bot. The answers will not be saved. And some blocks like "Send email" will be skipped.',
      tags: ["Chat"],
    })
    .input(startPreviewChatInputSchema)
    .output(startPreviewChatResponseSchema)
    .handler(handleStartChatPreview),
  updateTypebotInSessionProcedure: protectedProcedure
    .route({
      method: "POST",
      path: "/v1/sessions/{sessionId}/updateTypebot",
      summary: "Update typebot in session",
      description:
        "Update chat session with latest typebot modifications. This is useful when you want to update the typebot in an ongoing session after making changes to it.",
      tags: ["Chat"],
    })
    .input(updateTypebotInSessionInputSchema)
    .output(z.object({ message: z.literal("success") }))
    .handler(handleUpdateTypebotInSession),
};

export const legacyChatRouter = {
  saveClientLogsV1Procedure: publicProcedure
    .route({
      method: "POST",
      path: "/v1/sessions/{sessionId}/clientLogs",
      summary: "Save logs",
      deprecated: true,
      tags: ["Chat"],
    })
    .input(saveClientLogsV1InputSchema)
    .output(z.object({ message: z.string() }))
    .handler(handleSaveClientLogsV1),
  sendMessageV1Procedure: procedureWithOptionalUser
    .route({
      method: "POST",
      path: "/v1/sendMessage",
      summary: "Send a message",
      description:
        "To initiate a chat, do not provide a `sessionId` nor a `message`.\n\nContinue the conversation by providing the `sessionId` and the `message` that should answer the previous question.\n\nSet the `isPreview` option to `true` to chat with the non-published version of the typebot.",
      deprecated: true,
      tags: ["Chat"],
    })
    .input(sendMessageInputSchema)
    .output(chatReplySchema)
    .handler(handleSendMessageV1),
  sendMessageV2Procedure: procedureWithOptionalUser
    .route({
      method: "POST",
      path: "/v2/sendMessage",
      summary: "Send a message",
      description:
        "To initiate a chat, do not provide a `sessionId` nor a `message`.\n\nContinue the conversation by providing the `sessionId` and the `message` that should answer the previous question.\n\nSet the `isPreview` option to `true` to chat with the non-published version of the typebot.",
      deprecated: true,
      tags: ["Chat"],
    })
    .input(sendMessageInputSchema)
    .output(chatReplySchema)
    .handler(handleSendMessageV2),
};
