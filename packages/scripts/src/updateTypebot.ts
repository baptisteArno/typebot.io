import * as p from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const updateTypebot = async () => {
  await promptAndSetEnvironment("production");

  const typebotId = await p.text({
    message: "Typebot ID?",
  });

  if (!typebotId || p.isCancel(typebotId)) process.exit();

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

updateTypebot();
