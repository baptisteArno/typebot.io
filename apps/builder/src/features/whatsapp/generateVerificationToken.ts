import { createId } from "@paralleldrive/cuid2";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";

export const generateVerificationToken = authenticatedProcedure.handler(
  async () => {
    const oneHourLater = new Date(Date.now() + 1000 * 60 * 60);
    const verificationToken = await prisma.verificationToken.create({
      data: {
        token: createId(),
        expires: oneHourLater,
        identifier: "whatsapp webhook",
      },
    });

    return { verificationToken: verificationToken.token };
  },
);
