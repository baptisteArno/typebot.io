import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { clientUserSchema, userSchema } from "@typebot.io/user/schemas";
import z from "zod";

const outputSchema = clientUserSchema.merge(
  userSchema.pick({ termsAcceptedAt: true }),
);

export const acceptTerms = authenticatedProcedure
  .input(z.void())
  .output(outputSchema)
  .handler(async ({ context: { user } }) => {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        termsAcceptedAt: new Date(),
      },
    });
    return outputSchema.parse(updatedUser);
  });
