import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { collaboratorSchema } from "@typebot.io/schemas/features/collaborators";
import { isReadTypebotForbidden } from "@typebot.io/typebot/helpers/isReadTypebotForbidden";
import { z } from "@typebot.io/zod";

const collaboratorWithUserSchema = collaboratorSchema.extend({
  user: z.object({
    name: z.string().nullable(),
    image: z.string().nullable(),
    email: z.string().nullable(),
  }),
});

export const getCollaborators = authenticatedProcedure
  .route({
    method: "GET",
    path: "/v1/typebots/{typebotId}/collaborators",
    summary: "Get collaborators",
    tags: ["Collaborators"],
  })
  .input(
    z.object({
      typebotId: z.string(),
    }),
  )
  .output(
    z.object({
      collaborators: z.array(collaboratorWithUserSchema),
    }),
  )
  .handler(async ({ input: { typebotId }, context: { user } }) => {
    const existingTypebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      include: {
        collaborators: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
                email: true,
              },
            },
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
      },
    });
    if (
      !existingTypebot?.id ||
      (await isReadTypebotForbidden(existingTypebot, user))
    )
      throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

    return {
      collaborators: existingTypebot.collaborators,
    };
  });
