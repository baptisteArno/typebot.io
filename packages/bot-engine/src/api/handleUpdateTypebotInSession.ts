import { ORPCError } from "@orpc/server";
import { getSession } from "@typebot.io/chat-session/queries/getSession";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import prisma from "@typebot.io/prisma";
import type { PublicTypebot } from "@typebot.io/typebot/schemas/publicTypebot";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { Variable } from "@typebot.io/variables/schemas";
import { z } from "@typebot.io/zod";

export const updateTypebotInSessionInputSchema = z.object({
  sessionId: z.string(),
});

type Context = {
  user: { id: string };
};

export const handleUpdateTypebotInSession = async ({
  input: { sessionId },
  context: { user },
}: {
  input: z.infer<typeof updateTypebotInSessionInputSchema>;
  context: Context;
}) => {
  const session = await getSession(sessionId);
  if (!session?.state)
    throw new ORPCError("NOT_FOUND", { message: "Session not found" });

  const publicTypebot = (await prisma.publicTypebot.findFirst({
    where: {
      typebot: {
        id: session.state.typebotsQueue[0].typebot.id,
        OR: [
          {
            workspace: {
              members: {
                some: { userId: user.id, role: { in: ["ADMIN", "MEMBER"] } },
              },
            },
          },
          {
            collaborators: {
              some: { userId: user.id, type: { in: ["WRITE"] } },
            },
          },
        ],
      },
    },
    select: {
      edges: true,
      groups: true,
      variables: true,
    },
  })) as Pick<PublicTypebot, "edges" | "variables" | "groups"> | null;

  if (!publicTypebot)
    throw new ORPCError("UNAUTHORIZED", { message: "Unauthorized" });

  const newSessionState = updateSessionState(session.state, publicTypebot);

  await prisma.chatSession.updateMany({
    where: { id: session.id },
    data: { state: newSessionState },
  });

  return { message: "success" } as const;
};

const updateSessionState = (
  currentState: SessionState,
  newTypebot: Pick<PublicTypebot, "edges" | "variables" | "groups">,
): SessionState => ({
  ...currentState,
  typebotsQueue: currentState.typebotsQueue.map((typebotInQueue, index) =>
    index === 0
      ? {
          ...typebotInQueue,
          typebot: {
            ...typebotInQueue.typebot,
            edges: newTypebot.edges,
            groups: newTypebot.groups,
            variables: updateVariablesInSession(
              typebotInQueue.typebot.variables,
              newTypebot.variables,
            ),
          },
        }
      : typebotInQueue,
  ) as SessionState["typebotsQueue"],
});

const updateVariablesInSession = (
  currentVariables: Variable[],
  newVariables: Typebot["variables"],
): Variable[] => [
  ...currentVariables,
  ...newVariables.filter(
    (newVariable) =>
      !currentVariables.find(
        (currentVariable) => currentVariable.id === newVariable.id,
      ),
  ),
];
