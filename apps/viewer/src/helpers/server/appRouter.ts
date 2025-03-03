import { continueChat } from "@/features/chat/api/continueChat";
import { saveClientLogsV1 } from "@/features/chat/api/legacy/saveClientLogsV1";
import { sendMessageV1 } from "@/features/chat/api/legacy/sendMessageV1";
import { sendMessageV2 } from "@/features/chat/api/legacy/sendMessageV2";
import { saveClientLogs } from "@/features/chat/api/saveClientLogs";
import { startChat } from "@/features/chat/api/startChat";
import { startChatPreview } from "@/features/chat/api/startChatPreview";
import { updateTypebotInSession } from "@/features/chat/api/updateTypebotInSession";
import { generateUploadUrlV1 } from "@/features/fileUpload/api/deprecated/generateUploadUrlV1";
import { generateUploadUrlV2 } from "@/features/fileUpload/api/deprecated/generateUploadUrlV2";
import { getUploadUrl } from "@/features/fileUpload/api/deprecated/getUploadUrl";
import { generateUploadUrl } from "@/features/fileUpload/api/generateUploadUrl";
import { whatsAppRouter } from "@/features/whatsapp/api/router";
import { router } from "./trpc";

export const appRouter = router({
  sendMessageV1,
  sendMessageV2,
  startChat,
  continueChat,
  startChatPreview: startChatPreview,
  getUploadUrl,
  generateUploadUrlV1,
  generateUploadUrlV2,
  generateUploadUrl,
  updateTypebotInSession,
  whatsAppRouter,
  saveClientLogsV1,
  saveClientLogs,
});

export type AppRouter = typeof appRouter;
