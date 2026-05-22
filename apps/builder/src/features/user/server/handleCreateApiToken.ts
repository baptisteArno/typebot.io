import { generateApiToken, hashApiToken } from "@typebot.io/lib/apiToken";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const createApiTokenInputSchema = z.object({
  name: z.string(),
});

export const apiTokenWithTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  token: z.string(),
});

export const handleCreateApiToken = async ({
  context: { user },
  input: { name },
}: {
  context: { user: Pick<User, "id"> };
  input: z.infer<typeof createApiTokenInputSchema>;
}) => {
  const token = generateApiToken();
  const apiToken = await prisma.apiToken.create({
    data: { name, ownerId: user.id, token: hashApiToken(token) },
  });
  return {
    apiToken: {
      id: apiToken.id,
      name: apiToken.name,
      createdAt: apiToken.createdAt,
      token,
    },
  };
};
