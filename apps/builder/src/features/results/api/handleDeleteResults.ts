import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { archiveResults } from "@typebot.io/results/archiveResults";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isWriteTypebotForbidden } from "@/features/typebot/helpers/isWriteTypebotForbidden";

export const deleteResultsInputSchema = z.object({
  typebotId: z
    .string()
    .describe(
      "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)",
    ),
  resultIds: z
    .string()
    .describe(
      "Comma separated list of ids. If not provided, all results will be deleted. ⚠️",
    )
    .optional(),
});

export const handleDeleteResults = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof deleteResultsInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const idsArray = input.resultIds?.split(",");
  const { typebotId } = input;
  const typebot = await prisma.typebot.findUnique({
    where: {
      id: typebotId,
    },
    select: {
      groups: true,
      workspace: {
        select: {
          id: true,
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
      collaborators: {
        select: {
          userId: true,
          type: true,
        },
      },
    },
  });
  if (!typebot || (await isWriteTypebotForbidden(typebot, user)))
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });
  const { success } = await archiveResults(prisma)({
    typebot: {
      id: typebotId,
      workspaceId: typebot.workspace.id,
      groups: typebot.groups as Typebot["groups"],
    },
    resultsFilter: {
      id: (idsArray?.length ?? 0) > 0 ? { in: idsArray } : undefined,
      typebotId,
    },
  });

  if (!success)
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });
};
