import { ORPCError } from "@orpc/server";
import { audiencesRouter } from "@typebot.io/audiences/orpc/router";
import { authRouter } from "@typebot.io/auth/api/router";
import { billingRouter } from "@typebot.io/billing/api/router";
import { publicProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { contactsRouter } from "@typebot.io/contacts/orpc/router";
import { fileUploadBuilderRouter } from "@typebot.io/file-input-block/api/router";
import { spacesRouter } from "@typebot.io/spaces/orpc/router";
import { builderWhatsAppRouter } from "@typebot.io/whatsapp/api/router";
import { z } from "zod";
import { analyticsRouter } from "@/features/analytics/api/router";
import { googleSheetsRouter } from "@/features/blocks/integrations/googleSheets/api/router";
import { httpRequestRouter } from "@/features/blocks/integrations/httpRequest/api/router";
import { openAIRouter } from "@/features/blocks/integrations/openai/api/router";
import { emailRouter } from "@/features/blocks/integrations/sendEmail/api/router";
import { getLinkedTypebots } from "@/features/blocks/logic/typebotLink/api/getLinkedTypebots";
import { collaboratorsRouter } from "@/features/collaboration/api/router";
import { credentialsRouter } from "@/features/credentials/api/router";
import { customDomainsRouter } from "@/features/customDomains/api/router";
import { generateGroupTitle } from "@/features/editor/api/generateGroupTitle";
import { emailsRouter } from "@/features/emails/api/router";
import { getFeatureFlags } from "@/features/featureFlags/api/getFeatureFlags";
import { folderRouter } from "@/features/folders/api/router";
import { forgeRouter } from "@/features/forge/api/router";
import { resultsRouter } from "@/features/results/api/router";
import { telemetryRouter } from "@/features/telemetry/api/router";
import { themeRouter } from "@/features/theme/api/router";
import { typebotRouter } from "@/features/typebot/api/router";
import { generateUploadUrl } from "@/features/upload/api/generateUploadUrl";
import { userRouter } from "@/features/user/server/routers";
import { workspaceRouter } from "@/features/workspace/api/router";

const healthz = publicProcedure.handler(async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

const httpRequestSpecMocks = {
  fail: publicProcedure
    .route({
      method: "POST",
      path: "/mock/fail",
    })
    .handler(() => {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Fail",
      });
    }),
  mirrorBody: publicProcedure
    .route({
      method: "POST",
      path: "/mock/mirror-body",
      inputStructure: "detailed",
    })
    .input(z.object({ body: z.unknown() }))
    .handler(({ input }) => input.body),
};

export const appRouter: AppRouter = {
  getLinkedTypebots,
  analytics: analyticsRouter,
  workspace: workspaceRouter,
  typebot: typebotRouter,
  httpRequest: httpRequestRouter,
  results: resultsRouter,
  theme: themeRouter,
  collaborators: collaboratorsRouter,
  customDomains: customDomainsRouter,
  whatsApp: builderWhatsAppRouter,
  folders: folderRouter,
  emails: emailsRouter,
  user: userRouter,
  healthz,
  httpRequestSpecMocks,
  generateUploadUrl,
  fileInput: fileUploadBuilderRouter,
  openAI: openAIRouter,
  forge: forgeRouter,
  sheets: googleSheetsRouter,
  email: emailRouter,
  telemetry: telemetryRouter,
  generateGroupTitle,
  credentials: credentialsRouter,
  getFeatureFlags,
  auth: authRouter,
  billing: billingRouter,
  audiences: audiencesRouter,
  spaces: spacesRouter,
  contacts: contactsRouter,
};

export type AppRouter = {
  getLinkedTypebots: typeof getLinkedTypebots;
  analytics: typeof analyticsRouter;
  workspace: typeof workspaceRouter;
  typebot: typeof typebotRouter;
  httpRequest: typeof httpRequestRouter;
  results: typeof resultsRouter;
  theme: typeof themeRouter;
  collaborators: typeof collaboratorsRouter;
  customDomains: typeof customDomainsRouter;
  whatsApp: typeof builderWhatsAppRouter;
  folders: typeof folderRouter;
  emails: typeof emailsRouter;
  user: typeof userRouter;
  healthz: typeof healthz;
  httpRequestSpecMocks: typeof httpRequestSpecMocks;
  generateUploadUrl: typeof generateUploadUrl;
  fileInput: typeof fileUploadBuilderRouter;
  openAI: typeof openAIRouter;
  forge: typeof forgeRouter;
  sheets: typeof googleSheetsRouter;
  email: typeof emailRouter;
  telemetry: typeof telemetryRouter;
  generateGroupTitle: typeof generateGroupTitle;
  credentials: typeof credentialsRouter;
  getFeatureFlags: typeof getFeatureFlags;
  auth: typeof authRouter;
  billing: typeof billingRouter;
};
