import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const deleteApiTokenInputSchema = z.object({
  tokenId: z.string(),
});

export const apiTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  token: z.string(),
  ownerId: z.string(),
});

export const handleDeleteApiToken = async ({
  input: { tokenId },
  context: { user },
}: {
  input: z.infer<typeof deleteApiTokenInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
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
};
