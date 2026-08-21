import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const updateWorkspace = async () => {
  assertProductionEnvironment();

  const workspaceId = await getRequiredInput({
    message: "Workspace ID?",
    name: "workspace-id",
  });

  if (
    !(await confirmAction({
      message: `Mark production workspace ${workspaceId} as verified?`,
    }))
  )
    return;

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

runScript(updateWorkspace);
