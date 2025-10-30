import * as p from "@clack/prompts";
import { isCancel } from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const inspectTypebot = async () => {
  await promptAndSetEnvironment("production");

  const type = await p.select<"id" | "publicId" | "customDomain">({
    message: "Select way",
    options: [
      { label: "ID", value: "id" },
      { label: "Public ID", value: "publicId" },
      { label: "Custom domain", value: "customDomain" },
    ],
  });

  if (!type || isCancel(type)) process.exit();

  const val = await p.text({
    message: "Enter value",
  });

  if (!val || isCancel(val)) process.exit();

  const where = parseWhere(type, val);

  const typebot = await prisma.typebot.findFirst({
    where,
    select: {
      version: true,
      id: true,
      name: true,
      riskLevel: true,
      publicId: true,
      customDomain: true,
      createdAt: true,
      isArchived: true,
      isClosed: true,
      publishedTypebot: {
        select: {
          id: true,
        },
      },
      collaborators: {
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
          plan: true,
          isPastDue: true,
          isSuspended: true,
          members: {
            select: {
              role: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!typebot) {
    console.log("Typebot not found");
    return;
  }

  console.log(`https://app.typebot.io/typebots/${typebot.id}/edit`);

  console.log(JSON.stringify(typebot, null, 2));
};

const parseWhere = (type: "id" | "publicId" | "customDomain", val: string) => {
  if (type === "id") return { id: val };
  if (type === "publicId") return { publicId: val };
  if (type === "customDomain")
    return { customDomain: val.replace("https://", "") };
};

inspectTypebot();
