import { googleSheetsRouter } from "@/features/blocks/integrations/googleSheets/api/router";
import { openAIRouter } from "@/features/blocks/integrations/openai/api/router";
import { getAppVersionProcedure } from "@/features/dashboard/api/getAppVersionProcedure";
import { forgeRouter } from "@/features/forge/api/router";
import { telemetryRouter } from "@/features/telemetry/api/router";
import { generateUploadUrl } from "@/features/upload/api/generateUploadUrl";
import { internalWhatsAppRouter } from "@/features/whatsapp/router";
import { router } from "../trpc";

export const internalRouter = router({
  getAppVersionProcedure,
  generateUploadUrl,
  whatsAppInternal: internalWhatsAppRouter,
  openAI: openAIRouter,
  forge: forgeRouter,
  sheets: googleSheetsRouter,
  telemetry: telemetryRouter,
});

export type InternalRouter = typeof internalRouter;
