import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";

export const isPublicIdAvailable = authenticatedProcedure
  .input(
    z.object({
      publicId: z.string(),
    }),
  )
  .handler(async ({ input: { publicId } }) => {
    const exists = await prisma.typebot.count({
      where: { publicId },
    });
    return { isAvailable: !exists };
  });
