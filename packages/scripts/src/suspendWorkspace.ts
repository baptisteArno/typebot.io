import { isCancel, select, text } from "@clack/prompts";
import { isEmpty } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const suspendWorkspace = async () => {
  await promptAndSetEnvironment("production");

  const type = await select<any, "id" | "publicId" | "workspaceId">({
    message: "Select way",
    options: [
      { label: "Typebot ID", value: "id" },
      { label: "Typebot public ID", value: "publicId" },
      { label: "Workspace ID", value: "workspaceId" },
    ],
  });

  if (!type || isCancel(type)) return;

  const val = await text({
    message: "Enter value",
  });

  if (!val || isCancel(val)) return;

  let workspaceId = type === "workspaceId" ? val : undefined;

  if (!workspaceId) {
    const typebot = await prisma.typebot.findFirst({
      where: {
        [type]: val,
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

suspendWorkspace();
