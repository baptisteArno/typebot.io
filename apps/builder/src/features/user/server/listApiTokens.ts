import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

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
  .handler(async ({ context: { user } }) => {
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
