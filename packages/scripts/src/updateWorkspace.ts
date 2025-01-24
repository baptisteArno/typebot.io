import * as p from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const updateWorkspace = async () => {
  await promptAndSetEnvironment("production");

  const workspaceId = await p.text({
    message: "Workspace ID?",
  });

  if (!workspaceId || p.isCancel(workspaceId)) process.exit();

  const workspace = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      isVerified: true,
    },
  });

  console.log(workspace);
};

updateWorkspace();
