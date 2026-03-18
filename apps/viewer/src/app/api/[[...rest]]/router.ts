import { chatRouter } from "@typebot.io/bot-engine/api/router";
import {
  protectedProcedure,
  publicProcedure,
} from "@typebot.io/config/orpc/viewer/middlewares";
import { fileUploadViewerRouter } from "@typebot.io/file-input-block/api/router";
import { webhookRouter } from "@typebot.io/webhook-block/api/router";
import { chatWhatsAppRouter } from "@typebot.io/whatsapp/api/router";
import { z } from "zod";
import {
  getMakeComBlocksInputSchema,
  handleGetMakeComBlocks,
} from "./handleGetMakeComBlocks";
import { handleGetMe } from "./handleGetMe";
import {
  getZapierStepsInputSchema,
  handleGetZapierSteps,
} from "./handleGetZapierSteps";
import { handleHealthz } from "./handleHealthz";
import { handleListTypebots } from "./handleListTypebots";

const healthz = publicProcedure
  .route({
    method: "GET",
    path: "/healthz",
  })
  .output(z.object({ status: z.literal("ok") }))
  .handler(handleHealthz);

const automationPlatformsRouter = {
  me: protectedProcedure
    .route({
      method: "GET",
      path: "/users/me",
    })
    .handler(handleGetMe),

  typebots: protectedProcedure
    .route({
      method: "GET",
      path: "/typebots",
    })
    .handler(handleListTypebots),

  zapierStepsEndpoint: protectedProcedure
    .route({
      method: "GET",
      path: "/typebots/{typebotId}/webhookSteps",
    })
    .input(getZapierStepsInputSchema)
    .handler(handleGetZapierSteps),

  makeComBlocksEndpoint: protectedProcedure
    .route({
      method: "GET",
      path: "/typebots/{typebotId}/webhookBlocks",
    })
    .input(getMakeComBlocksInputSchema)
    .handler(handleGetMakeComBlocks),
};

export type AppRouter = {
  publicChatRouter: typeof chatRouter;
  fileInput: typeof fileUploadViewerRouter;
  healthz: typeof healthz;
  automationPlatformsRouter: typeof automationPlatformsRouter;
  webhook: typeof webhookRouter;
  chatWhatsAppRouter: typeof chatWhatsAppRouter;
};

export const appRouter: AppRouter = {
  publicChatRouter: chatRouter,
  fileInput: fileUploadViewerRouter,
  healthz,
  // TODO: Migrate to builder (once builder migrated to oRPC) and add rewrites
  automationPlatformsRouter,
  webhook: webhookRouter,
  chatWhatsAppRouter,
};
