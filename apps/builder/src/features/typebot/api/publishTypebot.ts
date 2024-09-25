import { parseTypebotPublishEvents } from "@/features/telemetry/helpers/parseTypebotPublishEvents";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/schemas";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import { computeRiskLevel } from "@typebot.io/radar";
import { settingsSchema } from "@typebot.io/settings/schemas";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { themeSchema } from "@typebot.io/theme/schemas";
import { edgeSchema } from "@typebot.io/typebot/schemas/edge";
import { startEventSchema } from "@typebot.io/typebot/schemas/events/start/schema";
import { variableSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { isWriteTypebotForbidden } from "../helpers/isWriteTypebotForbidden";

export const publishTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/typebots/{typebotId}/publish",
      protect: true,
      summary: "Publish a typebot",
      tags: ["Typebot"],
    },
  })
  .input(
    z.object({
      typebotId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
        ),
    }),
  )
  .output(
    z.object({
      message: z.literal("success"),
    }),
  )
  .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
    const existingTypebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      include: {
        collaborators: true,
        publishedTypebot: true,
        workspace: {
          select: {
            plan: true,
            isVerified: true,
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });
    if (
      !existingTypebot?.id ||
      (await isWriteTypebotForbidden(existingTypebot, user))
    )
      throw new TRPCError({ code: "NOT_FOUND", message: "Typebot not found" });

    const hasFileUploadBlocks = parseGroups(existingTypebot.groups, {
      typebotVersion: existingTypebot.version,
    }).some((group) =>
      group.blocks.some((block) => block.type === InputBlockType.FILE),
    );

    if (hasFileUploadBlocks && existingTypebot.workspace.plan === Plan.FREE)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "File upload blocks can't be published on the free plan",
      });

    const typebotWasVerified =
      existingTypebot.riskLevel === -1 || existingTypebot.workspace.isVerified;

    if (
      !typebotWasVerified &&
      existingTypebot.riskLevel &&
      existingTypebot.riskLevel > 80
    )
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Radar detected a potential malicious typebot. This bot is being manually reviewed by Fraud Prevention team.",
      });

    const riskLevel = typebotWasVerified
      ? 0
      : computeRiskLevel(existingTypebot, {
          debug: env.NODE_ENV === "development",
        });

    if (riskLevel > 0 && riskLevel !== existingTypebot.riskLevel) {
      if (env.MESSAGE_WEBHOOK_URL && riskLevel !== 100 && riskLevel > 60)
        await fetch(env.MESSAGE_WEBHOOK_URL, {
          method: "POST",
          body: `⚠️ Suspicious typebot to be reviewed: ${existingTypebot.name} (${env.NEXTAUTH_URL}/typebots/${existingTypebot.id}/edit) (workspace: ${existingTypebot.workspaceId})`,
        }).catch((err) => {
          console.error("Failed to send message", err);
        });

      await prisma.typebot.updateMany({
        where: {
          id: existingTypebot.id,
        },
        data: {
          riskLevel,
        },
      });
      if (riskLevel > 80) {
        if (existingTypebot.publishedTypebot)
          await prisma.publicTypebot.deleteMany({
            where: {
              id: existingTypebot.publishedTypebot.id,
            },
          });
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Radar detected a potential malicious typebot. This bot is being manually reviewed by Fraud Prevention team.",
        });
      }
    }

    const publishEvents = await parseTypebotPublishEvents({
      existingTypebot,
      userId: user.id,
      hasFileUploadBlocks,
    });

    if (existingTypebot.publishedTypebot)
      await prisma.publicTypebot.updateMany({
        where: {
          id: existingTypebot.publishedTypebot.id,
        },
        data: {
          version: existingTypebot.version,
          edges: z.array(edgeSchema).parse(existingTypebot.edges),
          groups: parseGroups(existingTypebot.groups, {
            typebotVersion: existingTypebot.version,
          }),
          events:
            (existingTypebot.version === "6"
              ? z.tuple([startEventSchema])
              : z.null()
            ).parse(existingTypebot.events) ?? undefined,
          settings: settingsSchema.parse(existingTypebot.settings),
          variables: z.array(variableSchema).parse(existingTypebot.variables),
          theme: themeSchema.parse(existingTypebot.theme),
        },
      });
    else
      await prisma.publicTypebot.createMany({
        data: {
          version: existingTypebot.version,
          typebotId: existingTypebot.id,
          edges: z.array(edgeSchema).parse(existingTypebot.edges),
          groups: parseGroups(existingTypebot.groups, {
            typebotVersion: existingTypebot.version,
          }),
          events:
            (existingTypebot.version === "6"
              ? z.tuple([startEventSchema])
              : z.null()
            ).parse(existingTypebot.events) ?? undefined,
          settings: settingsSchema.parse(existingTypebot.settings),
          variables: z.array(variableSchema).parse(existingTypebot.variables),
          theme: themeSchema.parse(existingTypebot.theme),
        },
      });

    await trackEvents([
      ...publishEvents,
      {
        name: "Typebot published",
        workspaceId: existingTypebot.workspaceId,
        typebotId: existingTypebot.id,
        userId: user.id,
        data: {
          name: existingTypebot.name,
          isFirstPublish: existingTypebot.publishedTypebot ? undefined : true,
        },
      },
    ]);

    return { message: "success" };
  });
