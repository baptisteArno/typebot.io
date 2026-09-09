import { logInSessionSchema } from "@typebot.io/logs/schemas";
import { settingsSchema } from "@typebot.io/settings/schemas";
import { themeSchema } from "@typebot.io/theme/schemas";
import { z } from "zod";
import { startChatResponseSchema } from "./schemas";

export const maxPreviewLogBatchSize = 100;

export const previewHostMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("typebot-preview:init"),
    documentId: z.uuid(),
    initialChatReply: startChatResponseSchema,
    previewTheme: themeSchema.optional(),
    previewSettings: settingsSchema.optional(),
  }),
  z.object({
    type: z.literal("typebot-preview:appearance"),
    documentId: z.uuid(),
    previewTheme: themeSchema.optional(),
    previewSettings: settingsSchema.optional(),
  }),
]);

export const previewFrameMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("typebot-preview:ready"),
    documentId: z.uuid(),
  }),
  z.object({
    type: z.literal("typebot-preview:input"),
    documentId: z.uuid(),
    blockId: z.string().max(256),
  }),
  z.object({
    type: z.literal("typebot-preview:logs"),
    documentId: z.uuid(),
    logs: z.array(logInSessionSchema).max(maxPreviewLogBatchSize),
  }),
]);
