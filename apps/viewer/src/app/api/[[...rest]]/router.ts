import { ORPCError } from "@orpc/server";
import { isHttpRequestBlock } from "@typebot.io/blocks-core/helpers";
import {
  legacyChatRouter,
  publicChatRouter,
} from "@typebot.io/bot-engine/api/router";
import {
  os,
  protectedProcedure,
  publicProcedure,
} from "@typebot.io/config/orpc/viewer/middlewares";
import * as fileInputRouter from "@typebot.io/file-input-block/api/router";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import prisma from "@typebot.io/prisma";
import * as webhookRouter from "@typebot.io/webhook-block/api/router";
import { chatWhatsAppRouter } from "@typebot.io/whatsapp/api/router";
import { z } from "@typebot.io/zod";

const publicRouter = os.tag("docs").router({
  publicChatRouter,
  fileInput: fileInputRouter.publicRouter,
});

const privateRouter = {
  healthz: publicProcedure
    .route({
      method: "GET",
      path: "/healthz",
    })
    .output(z.object({ status: z.literal("ok") }))
    .handler(() => ({ status: "ok" })),
  success: publicProcedure
    .route({
      method: "POST",
      path: "/mock/success",
    })
    .handler(() => ({ statusCode: 200, statusMessage: "OK" })),
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

  // TODO: Migrate to builder (once builder migrated to oRPC) and add rewrites
  automationPlatformsRouter: {
    me: protectedProcedure
      .route({
        method: "GET",
        path: "/users/me",
      })
      .handler(({ context: { user } }) => ({
        id: user.id,
        email: user.email,
      })),
    typebots: protectedProcedure
      .route({
        method: "GET",
        path: "/typebots",
      })
      .handler(async ({ context: { user } }) => {
        const typebots = await prisma.typebot.findMany({
          where: {
            workspace: { members: { some: { userId: user.id } } },
            isArchived: { not: true },
          },
          select: {
            name: true,
            publishedTypebot: { select: { id: true } },
            id: true,
          },
        });

        return {
          typebots: typebots.map((typebot) => ({
            id: typebot.id,
            name: typebot.name,
            publishedTypebotId: typebot.publishedTypebot?.id,
          })),
        };
      }),
    zapierStepsEndpoint: protectedProcedure
      .route({
        method: "GET",
        path: "/typebots/{typebotId}/webhookSteps",
      })
      .input(z.object({ typebotId: z.string() }))
      .handler(async ({ context: { user }, input: { typebotId } }) => {
        const typebot = await prisma.typebot.findFirst({
          where: {
            id: typebotId,
            workspace: { members: { some: { userId: user.id } } },
          },
          select: { groups: true, version: true },
        });
        if (!typebot)
          throw new ORPCError("NOT_FOUND", {
            message: "Typebot not found",
          });
        const groups = parseGroups(typebot?.groups, {
          typebotVersion: typebot?.version,
        });
        const emptyHttpRequestBlocks = groups.reduce<
          { id: string; blockId: string; name: string }[]
        >((emptyWebhookBlocks, group) => {
          const blocks = group.blocks.filter((block) =>
            isHttpRequestBlock(block),
          );
          return [
            ...emptyWebhookBlocks,
            ...blocks.map((b) => ({
              blockId: group.id,
              id: b.id,
              name: `${group.title} > ${b.id}`,
            })),
          ];
        }, []);

        return { steps: emptyHttpRequestBlocks };
      }),
    makeComBlocksEndpoint: protectedProcedure
      .route({
        method: "GET",
        path: "/typebots/{typebotId}/webhookBlocks",
      })
      .input(z.object({ typebotId: z.string() }))
      .handler(async ({ context: { user }, input: { typebotId } }) => {
        const typebot = await prisma.typebot.findFirst({
          where: {
            id: typebotId,
            workspace: { members: { some: { userId: user.id } } },
          },
          select: { groups: true, version: true },
        });
        if (!typebot)
          throw new ORPCError("NOT_FOUND", {
            message: "Typebot not found",
          });
        const groups = parseGroups(typebot?.groups, {
          typebotVersion: typebot?.version,
        });
        const emptyHttpRequestBlocks = groups.reduce<
          { id: string; blockId: string; name: string }[]
        >((emptyWebhookBlocks, group) => {
          const blocks = group.blocks.filter((block) =>
            isHttpRequestBlock(block),
          );
          return [
            ...emptyWebhookBlocks,
            ...blocks.map((b) => ({
              // Duplicate id to keep compatibility with old API
              id: b.id,
              blockId: b.id,
              name: `${group.title} > ${b.id}`,
            })),
          ];
        }, []);

        return { blocks: emptyHttpRequestBlocks };
      }),
  },
  fileInput: fileInputRouter.privateRouter,
  webhook: webhookRouter.privateRouter,
  legacyChatRouter,
  chatWhatsAppRouter,
};

export const appRouter = {
  publicRouter,
  privateRouter,
};

export type AppRouter = typeof appRouter;
