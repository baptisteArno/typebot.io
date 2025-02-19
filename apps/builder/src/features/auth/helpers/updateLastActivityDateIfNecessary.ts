import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/schemas/features/user/schema";

export const updateLastActivityDateIfNecessary = async (
  user: Pick<User, "id" | "lastActivityAt">,
) => {
  const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

  if (!datesAreOnSameDay(user.lastActivityAt, new Date())) {
    await prisma.user.updateMany({
      where: { id: user.id },
      data: { lastActivityAt: new Date() },
    });
  }
};
