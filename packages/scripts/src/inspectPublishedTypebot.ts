import * as p from "@clack/prompts";
import { isCancel } from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const inspectTypebot = async () => {
  await promptAndSetEnvironment("production");

  const type = await p.select<any, "id" | "publicId">({
    message: "Select way",
    options: [
      { label: "ID", value: "id" },
      { label: "Public ID", value: "publicId" },
    ],
  });

  if (!type || isCancel(type)) process.exit();

  const val = await p.text({
    message: "Enter value",
  });

  if (!val || isCancel(val)) process.exit();

  const typebot = await prisma.typebot.findFirst({
    where: {
      [type]: val,
    },
    select: {
      publishedTypebot: {
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!typebot) {
    console.log("Typebot not found");
    return;
  }

  console.log(JSON.stringify(typebot, null, 2));
};

inspectTypebot();
