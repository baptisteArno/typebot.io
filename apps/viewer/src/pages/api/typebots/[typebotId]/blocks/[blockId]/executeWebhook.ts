import { authenticateUser } from "@/helpers/authenticateUser";
import { isHttpRequestBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { HttpRequest } from "@typebot.io/blocks-integrations/httpRequest/schema";
import {
  executeHttpRequest,
  parseWebhookAttributes,
} from "@typebot.io/bot-engine/blocks/integrations/httpRequest/executeHttpRequestBlock";
import { parseSampleResult } from "@typebot.io/bot-engine/blocks/integrations/httpRequest/parseSampleResult";
import { fetchLinkedChildTypebots } from "@typebot.io/bot-engine/blocks/logic/typebotLink/fetchLinkedChildTypebots";
import { fetchLinkedParentTypebots } from "@typebot.io/bot-engine/blocks/logic/typebotLink/fetchLinkedParentTypebots";
import { saveLog } from "@typebot.io/bot-engine/logs/saveLog";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import {
  initMiddleware,
  methodNotAllowed,
  notFound,
} from "@typebot.io/lib/api/utils";
import { byId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import type { AnswerInSessionState } from "@typebot.io/results/schemas/answers";
import type { ResultValues } from "@typebot.io/results/schemas/results";
import {
  deleteSessionStore,
  getSessionStore,
} from "@typebot.io/runtime-session-store";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { Variable } from "@typebot.io/variables/schemas";
import Cors from "cors";
import type { NextApiRequest, NextApiResponse } from "next";

const cors = initMiddleware(Cors());

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);
  if (req.method === "POST") {
    const user = await authenticateUser(req);
    const typebotId = req.query.typebotId as string;
    const blockId = req.query.blockId as string;
    const resultId = req.query.resultId as string | undefined;
    const { resultValues, variables, parentTypebotIds } = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as {
      resultValues: ResultValues;
      variables: Variable[];
      parentTypebotIds: string[];
    };
    const typebot = (await prisma.typebot.findUnique({
      where: { id: typebotId },
      include: { webhooks: true },
    })) as unknown as (Typebot & { webhooks: HttpRequest[] }) | null;
    if (!typebot) return notFound(res);
    const block = typebot.groups
      .flatMap<Block>((g) => g.blocks)
      .find(byId(blockId));
    if (!block || !isHttpRequestBlock(block))
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
    const linkedTypebotsParents = (await fetchLinkedParentTypebots({
      isPreview: !("typebotId" in typebot),
      parentTypebotIds,
      userId: user?.id,
    })) as (Typebot | PublicTypebot)[];
    const linkedTypebotsChildren = await fetchLinkedChildTypebots({
      isPreview: !("typebotId" in typebot),
      typebots: [typebot],
      userId: user?.id,
    })([]);

    const linkedTypebots = [
      ...linkedTypebotsParents,
      ...linkedTypebotsChildren,
    ];

    const answers = resultValues
      ? resultValues.answers.map((answer: any) => ({
          key:
            (answer.variableId
              ? typebot.variables.find(
                  (variable) => variable.id === answer.variableId,
                )?.name
              : typebot.groups.find((group) =>
                  group.blocks.find((block) => block.id === answer.blockId),
                )?.title) ?? "",
          value: answer.content,
        }))
      : arrayify(
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
      sessionStore: getSessionStore(typebotId),
    });

    if (!parsedWebhook)
      return res.status(500).send({
        statusCode: 500,
        data: { message: `Couldn't parse webhook attributes` },
      });

    const { response, logs } = await executeHttpRequest(parsedWebhook, {
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

    deleteSessionStore(typebotId);
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
