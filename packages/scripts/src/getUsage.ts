import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  getRequiredInput,
  runScript,
} from "./cli";

const getUsage = async () => {
  assertProductionEnvironment();

  const workspaceId = await getRequiredInput({
    message: "Workspace ID?",
    name: "workspace-id",
  });
  const from = await getRequiredInput({
    message: "Start date (ISO 8601)?",
    name: "from",
    validate: validateDate,
  });
  const to = await getRequiredInput({
    message: "End date (ISO 8601, exclusive)?",
    name: "to",
    validate: validateDate,
  });
  if (Date.parse(from) >= Date.parse(to))
    throw new Error("--from must be earlier than --to");

  const count = await prisma.result.count({
    where: {
      typebot: { workspaceId },
      hasStarted: true,
      createdAt: {
        gte: from,
        lt: to,
      },
    },
  });

  console.log(count);
};

const validateDate = (value: string) =>
  Number.isNaN(Date.parse(value)) ? "Expected an ISO 8601 date" : undefined;

runScript(getUsage);
