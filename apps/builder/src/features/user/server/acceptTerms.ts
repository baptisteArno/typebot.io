import prisma from "@typebot.io/prisma";
import { clientUserSchema, userSchema } from "@typebot.io/user/schemas";
import { authenticatedProcedure } from "@/helpers/server/trpc";

const outputSchema = clientUserSchema.merge(
  userSchema.pick({ termsAcceptedAt: true }),
);

export const acceptTerms = authenticatedProcedure
  .output(outputSchema)
  .mutation(async ({ ctx: { user } }) => {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        termsAcceptedAt: new Date(),
      },
    });
    return outputSchema.parse(updatedUser);
  });
