import { isCancel, text } from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const blockTypebot = async () => {
  await promptAndSetEnvironment("production");

  const typebotIdArgument = process.argv
    .find((argument) => argument.startsWith("--typebot-id="))
    ?.slice("--typebot-id=".length);
  const typebotId = typebotIdArgument
    ? typebotIdArgument
    : await text({ message: "Typebot ID?" });

  if (!typebotId || isCancel(typebotId)) return;

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

blockTypebot();
