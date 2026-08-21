import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const updateTypebot = async () => {
  assertProductionEnvironment();

  const typebotId = await getRequiredInput({
    message: "Typebot ID?",
    name: "typebot-id",
  });

  if (
    !(await confirmAction({
      message: `Set production typebot ${typebotId} risk level to -1?`,
    }))
  )
    return;

  const typebot = await prisma.typebot.update({
    where: {
      id: typebotId,
    },
    data: {
      riskLevel: -1,
    },
  });

  console.log(typebot);
};

runScript(updateTypebot);
