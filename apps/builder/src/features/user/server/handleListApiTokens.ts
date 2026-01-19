import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const listApiTokensOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
});

export const handleListApiTokens = async ({
  context: { user },
}: {
  context: { user: Pick<User, "id"> };
}) => {
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
};
