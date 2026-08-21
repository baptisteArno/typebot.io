import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  computeResultTranscript,
  parseTranscriptMessageText,
} from "@typebot.io/bot-engine/computeResultTranscript";
import { typebotInSessionStateSchema } from "@typebot.io/chat-session/schemas";
import { logSchema } from "@typebot.io/logs/schemas";
import prisma from "@typebot.io/prisma";
import { type Answer, answerSchema } from "@typebot.io/results/schemas/answers";
import { streamAllResultsToCsv } from "@typebot.io/results/streamAllResultsToCsv";
import { SessionStore } from "@typebot.io/runtime-session-store";
import { setVariableHistoryItemSchema } from "@typebot.io/variables/schemas";
import { z } from "zod";
import {
  assertProductionEnvironment,
  getRequiredInput,
  runScript,
} from "./cli";

const inspectResult = async () => {
  assertProductionEnvironment();

  const resultId = await getRequiredInput({
    message: "Result ID?",
    name: "result-id",
  });

  const result = await prisma.result.findUnique({
    where: {
      id: resultId,
    },
    select: {
      logs: {
        select: {
          status: true,
          context: true,
          description: true,
          details: true,
        },
      },
      typebotId: true,
      answers: {
        select: {
          blockId: true,
          content: true,
          createdAt: true,
        },
      },
      answersV2: {
        select: {
          blockId: true,
          content: true,
          createdAt: true,
          attachedFileUrls: true,
        },
      },
      edges: {
        select: {
          edgeId: true,
          index: true,
        },
      },
      setVariableHistory: {
        select: {
          blockId: true,
          blockIndex: true,
          variableId: true,
          value: true,
          index: true,
        },
      },
    },
  });

  if (!result) {
    console.log("Result not found");
    return;
  }

  const parsedLogs = z
    .array(
      logSchema.pick({
        status: true,
        context: true,
        description: true,
        details: true,
      }),
    )
    .parse(result.logs ?? []);

  writeFileSync(
    ensureDirectoryExistence(`logs/results/${resultId}/logs.json`),
    JSON.stringify(
      parsedLogs.map((l) => ({ ...l, details: beautifyDetails(l.details) })),
      null,
      2,
    ),
  );

  writeFileSync(
    ensureDirectoryExistence(
      `logs/results/${resultId}/setVariableHistory.json`,
    ),
    JSON.stringify(result.setVariableHistory, null, 2),
  );

  await streamAllResultsToCsv(result.typebotId, {
    full: true,
    resultIds: [resultId],
    onProgressUpdate: console.log,
    writeStreamPath: ensureDirectoryExistence(
      `logs/results/${resultId}/result.csv`,
    ),
  });

  const typebot = await prisma.typebot.findUnique({
    where: {
      id: result.typebotId,
    },
    select: {
      publishedTypebot: {
        select: {
          version: true,
          groups: true,
          edges: true,
          variables: true,
          events: true,
        },
      },
      workspace: {
        select: {
          isSuspended: true,
          isPastDue: true,
          members: {
            select: {
              userId: true,
            },
          },
        },
      },
      collaborators: {
        select: {
          userId: true,
          type: true,
        },
      },
    },
  });

  if (!typebot?.publishedTypebot) {
    console.log("Typebot not found");
    return;
  }

  const answers = [...result.answersV2, ...result.answers]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map<Answer>((answer) => ({
      blockId: answer.blockId,
      content: answer.content,
      attachedFileUrls:
        "attachedFileUrls" in answer && answer.attachedFileUrls
          ? answerSchema.shape.attachedFileUrls.parse(answer.attachedFileUrls)
          : undefined,
    }));

  const visitedEdges = result.edges
    .sort((a, b) => a.index - b.index)
    .map((edge) => edge.edgeId);

  const setVariableHistory = result.setVariableHistory
    .sort((a, b) => a.index - b.index)
    .map(({ blockId, variableId, value, blockIndex }) => ({
      blockId,
      variableId,
      value: setVariableHistoryItemSchema.shape.value.parse(value),
      blockIndex,
    }));

  const transcript = computeResultTranscript({
    typebot: typebotInSessionStateSchema.parse({
      ...typebot.publishedTypebot,
      id: result.typebotId,
    }),
    answers,
    setVariableHistory,
    visitedEdges,
    debug: true,
    sessionStore: new SessionStore(),
  });

  writeFileSync(
    ensureDirectoryExistence(`logs/results/${resultId}/transcript.txt`),
    transcript
      .map((t) => `[${t.role}] ${parseTranscriptMessageText(t)}`)
      .join("\n\n"),
  );
};

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (existsSync(dirname)) {
    return filePath;
  }
  ensureDirectoryExistence(dirname);
  mkdirSync(dirname);
  return filePath;
}

const beautifyDetails = (details: string | null) => {
  if (!details) return null;
  try {
    return JSON.parse(details);
  } catch {
    return details;
  }
};

runScript(inspectResult);
