import { TRPCError } from "@trpc/server";
import { computeResultTranscript } from "@typebot.io/bot-engine/computeResultTranscript";
import { typebotInSessionStateSchema } from "@typebot.io/chat-session/schemas";
import prisma from "@typebot.io/prisma";
import type { Answer } from "@typebot.io/results/schemas/answers";
import { SessionStore } from "@typebot.io/runtime-session-store";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { z } from "@typebot.io/zod";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const getResultTranscript = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/typebots/{typebotId}/results/{resultId}/transcript",
      protect: true,
      summary: "Get result transcript",
      tags: ["Results"],
    },
  })
  .input(
    z.object({
      typebotId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
        ),
      resultId: z
        .string()
        .describe(
          "The `resultId` is returned by the /startChat endpoint or you can find it by listing results with `/results` endpoint",
        ),
    }),
  )
  .output(
    z.object({
      transcript: z.array(
        z.object({
          role: z.enum(["bot", "user"]),
          type: z.enum(["text", "image", "video", "audio"]),
          text: z.string().optional(),
          image: z.string().optional(),
          video: z.string().optional(),
          audio: z.string().optional(),
        }),
      ),
    }),
  )
  .query(async ({ input, ctx: { user } }) => {
    // Fetch typebot with necessary data for transcript computation
    const typebot = await prisma.typebot.findUnique({
      where: {
        id: input.typebotId,
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

    if (
      !typebot?.publishedTypebot ||
      (await isReadTypebotForbidden(typebot, user))
    )
      throw new TRPCError({ code: "NOT_FOUND", message: "Typebot not found" });

    // Fetch result data
    const result = await prisma.result.findUnique({
      where: {
        id: input.resultId,
        typebotId: input.typebotId,
      },
      select: {
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

    if (!result)
      throw new TRPCError({ code: "NOT_FOUND", message: "Result not found" });

    const answers = [...result.answersV2, ...result.answers]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map<Answer>((answer) => ({
        blockId: answer.blockId,
        content: answer.content,
        attachedFileUrls:
          "attachedFileUrls" in answer && answer.attachedFileUrls
            ? (answer.attachedFileUrls as string[])
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
        value: value as string | (string | null)[] | null,
        blockIndex,
      }));

    const transcript = computeResultTranscript({
      typebot: typebotInSessionStateSchema.parse({
        ...typebot.publishedTypebot,
        id: input.typebotId,
      }),
      answers,
      setVariableHistory,
      visitedEdges,
      sessionStore: new SessionStore(),
    });

    return { transcript };
  });
