import { TRPCError } from "@trpc/server";
import { isHttpRequestBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { httpRequestV5Schema } from "@typebot.io/blocks-integrations/httpRequest/schema";
import {
  executeHttpRequest,
  parseHttpRequestAttributes,
} from "@typebot.io/bot-engine/blocks/integrations/httpRequest/executeHttpRequestBlock";
import { parseSampleResult } from "@typebot.io/bot-engine/blocks/integrations/httpRequest/parseSampleResult";
import { fetchLinkedChildTypebots } from "@typebot.io/bot-engine/blocks/logic/typebotLink/fetchLinkedChildTypebots";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { AnswerInSessionState } from "@typebot.io/results/schemas/answers";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";
import { edgeSchema } from "@typebot.io/typebot/schemas/edge";
import { variableSchema } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";
import { canReadTypebots } from "@/helpers/databaseRules";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const testHttpRequest = authenticatedProcedure
  .input(
    z.object({
      typebotId: z.string(),
      blockId: z.string(),
      variables: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            value: z.unknown().optional(),
          }),
        )
        .optional(),
    }),
  )
  .output(
    z.object({
      statusCode: z.number(),
      data: z.unknown().optional(),
    }),
  )
  .mutation(async ({ input: { typebotId, blockId, variables }, ctx }) => {
    const typebot = await prisma.typebot.findFirst({
      where: canReadTypebots(typebotId, ctx.user),
      select: {
        version: true,
        groups: true,
        webhooks: true,
        variables: true,
        edges: true,
        workspaceId: true,
      },
    });

    if (!typebot)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Typebot not found",
      });

    const parsedTypebot = {
      groups: parseGroups(typebot.groups, {
        typebotVersion: typebot.version,
      }),
      variables: variableSchema.array().parse(typebot.variables),
      edges: edgeSchema.array().parse(typebot.edges),
    };

    const block = parsedTypebot.groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId));

    if (!block || !isHttpRequestBlock(block))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "HTTP request block not found",
      });

    const webhookId = "webhookId" in block ? block.webhookId : undefined;
    const webhook = httpRequestV5Schema
      .omit({
        id: true,
      })
      .parse(
        block.options?.webhook ??
          typebot.webhooks.find((w) => {
            if ("id" in w) return w.id === webhookId;
            return false;
          }),
      );

    if (!webhook)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Couldn't find webhook",
      });

    const { group } = getBlockById(blockId, parsedTypebot.groups);
    const linkedTypebots = await fetchLinkedChildTypebots({
      isPreview: !("typebotId" in typebot),
      typebots: [parsedTypebot],
      userId: ctx.user.id,
    })([]);

    const mergedVariables = parsedTypebot.variables.map((v) => {
      const matchingVariable = variables?.find(byId(v.id));
      if (!matchingVariable) return v;
      // Convert unknown value to the expected Variable value type
      const value = matchingVariable.value;
      return {
        ...v,
        value:
          typeof value === "string" || Array.isArray(value) || value == null
            ? value
            : String(value),
      };
    });

    const answers = arrayify(
      await parseSampleResult(parsedTypebot, linkedTypebots)(
        group.id,
        mergedVariables,
      ),
    );

    const mockedSessionId = "test-webhook";
    const sessionStore = getSessionStore(mockedSessionId);
    const parsedWebhook = await parseHttpRequestAttributes({
      httpRequest: webhook,
      isCustomBody: block.options?.isCustomBody,
      variables: mergedVariables,
      sessionStore,
      answers,
      proxy: block.options?.proxyCredentialsId
        ? {
            credentialsId: block.options.proxyCredentialsId,
            workspaceId: typebot.workspaceId,
          }
        : undefined,
    });
    deleteSessionStore(mockedSessionId);

    if (!parsedWebhook)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Couldn't parse webhook attributes",
      });

    const { response } = await executeHttpRequest(parsedWebhook, {
      timeout: block.options?.timeout,
    });

    return response;
  });

const arrayify = (
  obj: Record<string, string | boolean | undefined>,
): AnswerInSessionState[] =>
  Object.entries(obj)
    .map(([key, value]) => ({ key, value: value?.toString() }))
    .filter((a) => a.value) as AnswerInSessionState[];
