import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const getUsage = async () => {
  await promptAndSetEnvironment();

  const count = await prisma.result.count({
    where: {
      typebot: { workspaceId: "" },
      hasStarted: true,
      createdAt: {
        gte: "2023-09-18T00:00:00.000Z",
        lt: "2023-10-18T00:00:00.000Z",
      },
    },
  });

  console.log(count);
};

getUsage();
