import prisma from "@typebot.io/prisma";
import { z } from "zod";

export const isPublicIdAvailableInputSchema = z.object({
  publicId: z.string(),
});

export const handleIsPublicIdAvailable = async ({
  input: { publicId },
}: {
  input: z.infer<typeof isPublicIdAvailableInputSchema>;
}) => {
  const exists = await prisma.typebot.count({
    where: { publicId },
  });
  return { isAvailable: !exists };
};
