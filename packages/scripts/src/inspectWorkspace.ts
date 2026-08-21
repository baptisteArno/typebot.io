import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  getRequiredInput,
  runScript,
} from "./cli";

const inspectWorkspace = async () => {
  assertProductionEnvironment();

  const id = await getRequiredInput({
    message: "Workspace ID?",
    name: "workspace-id",
  });

  const workspace = await prisma.workspace.findFirst({
    where: {
      id,
    },
    include: {
      typebots: {
        take: 30,
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          updatedAt: true,
          id: true,
          name: true,
        },
      },
      members: {
        select: {
          user: { select: { id: true, email: true } },
          createdAt: true,
          role: true,
        },
      },
    },
  });

  if (!workspace) {
    console.log("Workspace not found");
    return;
  }

  console.log(JSON.stringify(workspace, null, 2));
};

runScript(inspectWorkspace);
