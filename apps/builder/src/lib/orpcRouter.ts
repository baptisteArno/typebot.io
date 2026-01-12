import { ORPCError } from "@orpc/server";
import { authRouter } from "@typebot.io/auth/api/router";
import {
  billingPrivateRouter,
  billingPublicRouter,
} from "@typebot.io/billing/api/router";
import {
  os,
  publicProcedure,
} from "@typebot.io/config/orpc/builder/middlewares";
import { builderRouter as fileInputBuilderRouter } from "@typebot.io/file-input-block/api/router";
import z from "zod";
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
import { getFeatureFlags } from "@/features/featureFlags/api/getFeatureFlags";
import { folderRouter } from "@/features/folders/api/router";
import { forgeRouter } from "@/features/forge/api/router";
import { resultsRouter } from "@/features/results/api/router";
import { telemetryRouter } from "@/features/telemetry/api/router";
import { themeRouter } from "@/features/theme/api/router";
import { typebotRouter } from "@/features/typebot/api/router";
import { generateUploadUrl } from "@/features/upload/api/generateUploadUrl";
import {
  internalUserRouter,
  publicUserRouter,
} from "@/features/user/server/routers";
import {
  internalWhatsAppRouter,
  publicWhatsAppRouter,
} from "@/features/whatsapp/router";
import { workspaceRouter } from "@/features/workspace/api/router";

const healthz = publicProcedure.handler(async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
}));

const publicRouter = os.tag("docs").router({
  getLinkedTypebots,
  analytics: analyticsRouter,
  workspace: workspaceRouter,
  typebot: typebotRouter,
  httpRequest: httpRequestRouter,
  results: resultsRouter,
  billing: billingPublicRouter,
  theme: themeRouter,
  collaborators: collaboratorsRouter,
  customDomains: customDomainsRouter,
  whatsApp: publicWhatsAppRouter,
  folders: folderRouter,
  user: publicUserRouter,
  healthz,
});

const privateRouter = {
  httpRequestSpecMocks: {
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
  },
  generateUploadUrl,
  fileInput: fileInputBuilderRouter,
  whatsAppInternal: internalWhatsAppRouter,
  openAI: openAIRouter,
  forge: forgeRouter,
  sheets: googleSheetsRouter,
  email: emailRouter,
  telemetry: telemetryRouter,
  generateGroupTitle,
  credentials: credentialsRouter,
  getFeatureFlags,
  auth: authRouter,
  userInternal: internalUserRouter,
  billing: billingPrivateRouter,
};

export const appRouter = {
  typebotRouter: os.tag("docs").router({
    typebotRouter,
  }),
};

export type AppRouter = typeof appRouter;
