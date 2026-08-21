import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const blockTypebot = async () => {
  assertProductionEnvironment();

  const typebotId = await getRequiredInput({
    message: "Typebot ID?",
    name: "typebot-id",
  });

  const typebot = await prisma.typebot.findUnique({
    where: { id: typebotId },
    select: {
      id: true,
      name: true,
      publicId: true,
      workspaceId: true,
    },
  });

  if (!typebot) throw new Error("Typebot not found");

  console.log(JSON.stringify(typebot, null, 2));
  if (
    !(await confirmAction({
      message: "Block this production typebot?",
    }))
  )
    return;

  const [removedPublicTypebots] = await prisma.$transaction([
    prisma.publicTypebot.deleteMany({ where: { typebotId } }),
    prisma.typebot.update({
      where: { id: typebotId },
      data: { riskLevel: 100 },
    }),
  ]);

  console.log({
    ...typebot,
    removedPublicTypebots: removedPublicTypebots.count,
    riskLevel: 100,
  });
};

runScript(blockTypebot);
