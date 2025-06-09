import prisma from "@typebot.io/prisma";

type CountResultsProps = {
  typebotId: string;
  fromDate?: Date;
};

export const countResults = async ({
  typebotId,
  fromDate,
}: CountResultsProps): Promise<number> => {
  return prisma.result.count({
    where: {
      typebotId,
      isArchived: false,
      createdAt: fromDate ? { gte: fromDate } : undefined,
    },
  });
};
