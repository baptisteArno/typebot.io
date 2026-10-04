import {
  continueChatInputSchema,
  handleContinueChat,
} from "@typebot.io/bot-engine/api/handleContinueChat";
import {
  handleStartChat,
  startChatInputSchema,
} from "@typebot.io/bot-engine/api/handleStartChat";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import prisma from "@typebot.io/prisma";
import { runWithHostExecutionContext } from "@typebot.io/runtime-session-store/hostExecutionContext";
import { z } from "zod";
import {
  equal,
  sessionBinding,
  verifyHostRequest,
  verifyHostServiceRequest,
} from "./trustedContext";

const requestSchema = z
  .object({
    flowId: z.string().min(1),
    message: z.unknown().optional(),
  })
  .strict();

const failure = () =>
  Response.json({ error: "Host bridge request rejected" }, { status: 401 });

export const verifyHostFlow = async (request: Request): Promise<Response> => {
  try {
    verifyHostServiceRequest(request);
    const { flowId } = z
      .object({ flowId: z.string().min(1).max(128) })
      .strict()
      .parse(await request.json());
    const publishedFlow = await prisma.publicTypebot.findFirst({
      where: { typebot: { publicId: flowId } },
      select: {
        version: true,
        typebot: {
          select: {
            isClosed: true,
            isArchived: true,
            workspace: { select: { isSuspended: true } },
          },
        },
      },
    });
    if (
      !publishedFlow?.version ||
      publishedFlow.typebot.isClosed ||
      publishedFlow.typebot.isArchived ||
      publishedFlow.typebot.workspace.isSuspended
    )
      return Response.json({ valid: false }, { status: 404 });
    return Response.json({ flowId, valid: true });
  } catch {
    return failure();
  }
};

export const getHostFlowMetadata = async (
  request: Request,
): Promise<Response> => {
  try {
    verifyHostServiceRequest(request);
    const { flowId } = z
      .object({ flowId: z.string().min(1).max(128) })
      .strict()
      .parse(await request.json());
    const typebot = await prisma.typebot.findUnique({
      where: { publicId: flowId },
      select: {
        id: true,
        name: true,
        updatedAt: true,
        isClosed: true,
        isArchived: true,
        workspace: { select: { isSuspended: true } },
        publishedTypebot: { select: { version: true } },
      },
    });
    if (!typebot)
      return Response.json({ error: "Flow not found" }, { status: 404 });
    const isPublished = Boolean(typebot.publishedTypebot?.version);
    const isAvailable =
      isPublished &&
      !typebot.isClosed &&
      !typebot.isArchived &&
      !typebot.workspace.isSuspended;
    return Response.json({
      publicFlowId: flowId,
      editableFlowId: typebot.id,
      displayName: typebot.name,
      status: isAvailable
        ? "PUBLISHED"
        : isPublished
          ? "UNAVAILABLE"
          : "UNPUBLISHED",
      updatedAt: typebot.updatedAt.toISOString(),
    });
  } catch {
    return failure();
  }
};

export const startHostChat = async (request: Request): Promise<Response> => {
  try {
    const trusted = verifyHostRequest(request);
    const body = requestSchema.parse(await request.json());
    if (body.flowId !== trusted.envelope.flowId) return failure();
    const input = startChatInputSchema.parse({
      publicId: body.flowId,
      message: body.message,
      textBubbleContentFormat: "markdown",
    });
    const result = await runWithHostExecutionContext(trusted, () =>
      handleStartChat({ input, context: {} }),
    );
    return Response.json({
      ...result,
      sessionBinding: sessionBinding(result.sessionId, trusted.envelope),
    });
  } catch {
    return failure();
  }
};

export const continueHostChat = async (
  request: Request,
  sessionId: string,
): Promise<Response> => {
  try {
    const trusted = verifyHostRequest(request);
    const body = requestSchema.parse(await request.json());
    if (body.flowId !== trusted.envelope.flowId) return failure();
    if (
      !equal(
        request.headers.get("x-host-session-binding"),
        sessionBinding(sessionId, trusted.envelope),
      )
    )
      return failure();
    const [session, publishedFlow] = await Promise.all([
      getSession(sessionId),
      prisma.publicTypebot.findFirst({
        where: { typebot: { publicId: body.flowId } },
        select: { id: true, typebotId: true },
      }),
    ]);
    if (!session?.state || !publishedFlow)
      return Response.json(
        { error: "Host session unavailable" },
        { status: 404 },
      );
    if (
      session.state.publicTypebotId !== publishedFlow.id ||
      session.state.typebotsQueue[0]?.typebot.id !== publishedFlow.typebotId
    )
      return Response.json(
        { error: "Host session unavailable" },
        { status: 404 },
      );
    const input = continueChatInputSchema.parse({
      sessionId,
      message: body.message,
      textBubbleContentFormat: "markdown",
    });
    const result = await runWithHostExecutionContext(trusted, () =>
      handleContinueChat({ input, context: {} }),
    );
    return Response.json(result);
  } catch {
    return failure();
  }
};
