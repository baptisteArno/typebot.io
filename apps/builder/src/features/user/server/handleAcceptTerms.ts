import prisma from "@typebot.io/prisma";
import {
  clientUserSchema,
  type User,
  userSchema,
} from "@typebot.io/user/schemas";

export const acceptTermsOutputSchema = clientUserSchema.merge(
  userSchema.pick({ termsAcceptedAt: true }),
);

export const handleAcceptTerms = async ({
  context: { user },
}: {
  context: { user: Pick<User, "id"> };
}) => {
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      termsAcceptedAt: new Date(),
    },
  });
  return acceptTermsOutputSchema.parse(updatedUser);
};
