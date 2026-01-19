import { generateId } from "@typebot.io/lib/utils";
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
};
