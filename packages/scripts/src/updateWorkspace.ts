import * as p from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const updateTypebot = async () => {
  await promptAndSetEnvironment("production");

  const workspaceId = (await p.text({
    message: "Workspace ID?",
  })) as string;

  const workspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      plan: "PRO",
    },
  });

  console.log(workspace);
};

updateTypebot();
