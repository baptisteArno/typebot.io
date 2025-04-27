import { authRouter } from "@/features/auth/api/router";
import { googleSheetsRouter } from "@/features/blocks/integrations/googleSheets/api/router";
import { openAIRouter } from "@/features/blocks/integrations/openai/api/router";
import { credentialsRouter } from "@/features/credentials/api/router";
import { generateGroupTitle } from "@/features/editor/api/generateGroupTitle";
import { getFeatureFlags } from "@/features/featureFlags/api/getFeatureFlags";
import { forgeRouter } from "@/features/forge/api/router";
import { telemetryRouter } from "@/features/telemetry/api/router";
import { generateUploadUrl } from "@/features/upload/api/generateUploadUrl";
import { internalWhatsAppRouter } from "@/features/whatsapp/router";
import { router } from "../trpc";

export const internalRouter = router({
  generateUploadUrl,
  whatsAppInternal: internalWhatsAppRouter,
  openAI: openAIRouter,
  forge: forgeRouter,
  sheets: googleSheetsRouter,
  telemetry: telemetryRouter,
  generateGroupTitle,
  credentials: credentialsRouter,
  getFeatureFlags,
  auth: authRouter,
});

export type InternalRouter = typeof internalRouter;
