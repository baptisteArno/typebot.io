import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { generateId } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

const apiTokenWithTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  token: z.string(),
});

export const createApiToken = authenticatedProcedure
  .route({
    method: "POST",
    path: "/v1/users/me/api-tokens",
    tags: ["User"],
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
  .handler(async ({ context: { user }, input: { name } }) => {
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
