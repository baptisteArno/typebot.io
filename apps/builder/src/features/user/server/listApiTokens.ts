import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { authenticatedProcedure } from "@/helpers/server/trpc";

const apiTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
});

export const listApiTokens = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/users/me/api-tokens",
      tags: ["User"],
      protect: true,
    },
  })
  .input(z.void())
  .output(
    z.object({
      apiTokens: z.array(apiTokenSchema),
    }),
  )
  .query(async ({ ctx: { user } }) => {
    const apiTokens = await prisma.apiToken.findMany({
      where: { ownerId: user.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { apiTokens };
  });
