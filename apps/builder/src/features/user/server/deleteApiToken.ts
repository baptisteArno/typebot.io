import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { authenticatedProcedure } from "@/helpers/server/trpc";

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
  .mutation(async ({ input: { tokenId }, ctx: { user } }) => {
    const existingToken = await prisma.apiToken.findUnique({
      where: { id: tokenId },
      select: { ownerId: true },
    });

    if (!existingToken || existingToken.ownerId !== user.id)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "API token not found",
      });

    const apiToken = await prisma.apiToken.delete({
      where: { id: tokenId },
    });
    return { apiToken };
  });
