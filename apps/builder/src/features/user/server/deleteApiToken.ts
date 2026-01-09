import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

const apiTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  token: z.string(),
  ownerId: z.string(),
});

export const deleteApiToken = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/users/me/api-tokens/{tokenId}",
      tags: ["User"],
      protect: true,
    },
  })
  .input(
    z.object({
      tokenId: z.string(),
    }),
  )
  .output(
    z.object({
      apiToken: apiTokenSchema,
    }),
  )
  .handler(async ({ input: { tokenId }, context: { user } }) => {
    const existingToken = await prisma.apiToken.findUnique({
      where: { id: tokenId },
      select: { ownerId: true },
    });

    if (!existingToken || existingToken.ownerId !== user.id)
      throw new ORPCError("NOT_FOUND", { message: "API token not found" });

    const apiToken = await prisma.apiToken.delete({
      where: { id: tokenId },
    });
    return { apiToken };
  });
