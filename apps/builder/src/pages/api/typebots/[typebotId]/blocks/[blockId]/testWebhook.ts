import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import { isWebhookBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { HttpRequest } from "@typebot.io/blocks-integrations/webhook/schema";
import {
  executeWebhook,
  parseWebhookAttributes,
} from "@typebot.io/bot-engine/blocks/integrations/webhook/executeWebhookBlock";
import { parseSampleResult } from "@typebot.io/bot-engine/blocks/integrations/webhook/parseSampleResult";
import { fetchLinkedChildTypebots } from "@typebot.io/bot-engine/blocks/logic/typebotLink/fetchLinkedChildTypebots";
import { saveLog } from "@typebot.io/bot-engine/logs/saveLog";
import { getBlockById } from "@typebot.io/groups/helpers";
import { methodNotAllowed } from "@typebot.io/lib/api/utils";
import { notFound } from "@typebot.io/lib/api/utils";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { AnswerInSessionState } from "@typebot.io/results/schemas/answers";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { Variable } from "@typebot.io/variables/schemas";
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const user = await getAuthenticatedUser(req, res);
    const typebotId = req.query.typebotId as string;
    const blockId = req.query.blockId as string;
    const resultId = req.query.resultId as string | undefined;
    const { variables } = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as {
      variables: Variable[];
    };
    const typebot = (await prisma.typebot.findUnique({
      where: { id: typebotId },
      include: { webhooks: true },
    })) as unknown as (Typebot & { webhooks: HttpRequest[] }) | null;
    if (!typebot) return notFound(res);
    const block = typebot.groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId));
    if (!block || !isWebhookBlock(block))
      return notFound(res, "Webhook block not found");
    const webhookId = "webhookId" in block ? block.webhookId : undefined;
    const webhook =
      block.options?.webhook ??
      typebot.webhooks.find((w) => {
        if ("id" in w) return w.id === webhookId;
        return false;
      });
    if (!webhook)
      return res
        .status(404)
        .send({ statusCode: 404, data: { message: `Couldn't find webhook` } });
    const { group } = getBlockById(blockId, typebot.groups);
    const linkedTypebots = await fetchLinkedChildTypebots({
      isPreview: !("typebotId" in typebot),
      typebots: [typebot],
      userId: user?.id,
    })([]);

    const answers = arrayify(
      await parseSampleResult(typebot, linkedTypebots)(group.id, variables),
    );

    const parsedWebhook = await parseWebhookAttributes({
      webhook,
      isCustomBody: block.options?.isCustomBody,
      typebot: {
        ...typebot,
        variables: typebot.variables.map((v) => {
          const matchingVariable = variables.find(byId(v.id));
          if (!matchingVariable) return v;
          return { ...v, value: matchingVariable.value };
        }),
      },
      answers,
    });

    if (!parsedWebhook)
      return res.status(500).send({
        statusCode: 500,
        data: { message: `Couldn't parse webhook attributes` },
      });

    const { response, logs } = await executeWebhook(parsedWebhook, {
      timeout: block.options?.timeout,
    });

    if (resultId)
      await Promise.all(
        logs?.map((log) =>
          saveLog({
            message: log.description,
            details: log.details,
            status: log.status as "error" | "success" | "info",
            resultId,
          }),
        ) ?? [],
      );

    return res.status(200).send(response);
  }
  return methodNotAllowed(res);
};

const arrayify = (
  obj: Record<string, string | boolean | undefined>,
): AnswerInSessionState[] =>
  Object.entries(obj)
    .map(([key, value]) => ({ key, value: value?.toString() }))
    .filter((a) => a.value) as AnswerInSessionState[];

export default handler;
