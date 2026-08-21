import { isEmpty } from "@typebot.io/lib/utils";
import {
  assertProductionEnvironment,
  confirmAction,
  getIdentifierInput,
  runScript,
} from "./cli";

const suspendWorkspace = async () => {
  assertProductionEnvironment();

  const { default: prisma } = await import("@typebot.io/prisma");

  const { type, value } = await getIdentifierInput({
    message: "Select way",
    options: [
      { label: "Typebot ID", name: "typebot-id" },
      { label: "Typebot public ID", name: "public-id" },
      { label: "Workspace ID", name: "workspace-id" },
    ],
  });

  let workspaceId = type === "workspace-id" ? value : undefined;

  if (!workspaceId) {
    const typebot = await prisma.typebot.findFirst({
      where: {
        [type === "typebot-id" ? "id" : "publicId"]: value,
      },
      select: {
        workspaceId: true,
      },
    });

    if (!typebot) {
      console.log("Typebot not found");
      return;
    }

    workspaceId = typebot.workspaceId;
  }

  if (isEmpty(workspaceId)) {
    console.log("Workspace not found");
    return;
  }

  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      name: true,
      isSuspended: true,
    },
  });

  if (!workspace) {
    console.log("Workspace not found");
    return;
  }

  if (workspace.isSuspended) {
    console.log("Workspace is already suspended");
    return;
  }

  console.log(JSON.stringify(workspace, null, 2));

  if (
    !(await confirmAction({
      message: "Suspend this production workspace?",
    }))
  )
    return;

  const result = await prisma.workspace.update({
    where: {
      id: workspaceId,
    },
    data: {
      isSuspended: true,
    },
  });

  console.log(JSON.stringify(result, null, 2));
};

runScript(suspendWorkspace);
