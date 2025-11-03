import { generateId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { authenticatedProcedure } from "@/helpers/server/trpc";

const apiTokenWithTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  token: z.string(),
});

export const createApiToken = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/users/me/api-tokens",
      tags: ["User"],
      protect: true,
    },
  })
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .output(
    z.object({
      apiToken: apiTokenWithTokenSchema,
    }),
  )
  .mutation(async ({ ctx: { user }, input: { name } }) => {
    const apiToken = await prisma.apiToken.create({
      data: { name, ownerId: user.id, token: generateId(24) },
    });
    return {
      apiToken: {
        id: apiToken.id,
        name: apiToken.name,
        createdAt: apiToken.createdAt,
        token: apiToken.token,
      },
    };
  });
