import prisma from "@typebot.io/prisma/withReadReplica";

export const resetBillingProps = async () => {
  console.log("Resetting billing props...");
  const { count } = await prisma.workspace.updateMany({
    where: {
      isPastDue: { not: true },
      OR: [
        {
          isQuarantined: true,
        },
        {
          chatsLimitFirstEmailSentAt: { not: null },
        },
      ],
    },
    data: {
      isQuarantined: false,
      chatsLimitFirstEmailSentAt: null,
      chatsLimitSecondEmailSentAt: null,
    },
  });
  console.log(`Resetted ${count} workspaces.`);
};
