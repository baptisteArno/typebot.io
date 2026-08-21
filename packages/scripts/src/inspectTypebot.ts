import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  getIdentifierInput,
  runScript,
} from "./cli";

const inspectTypebot = async () => {
  assertProductionEnvironment();

  const { type, value } = await getIdentifierInput({
    message: "Select way",
    options: [
      { label: "ID", name: "id" },
      { label: "Public ID", name: "public-id" },
      { label: "Custom domain", name: "custom-domain" },
    ],
  });

  const where = parseWhere(type, value);

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
      updatedAt: true,
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

  console.log(`https://app.typebot.com/typebots/${typebot.id}/edit`);

  console.log(JSON.stringify(typebot, null, 2));
};

const parseWhere = (
  type: "id" | "public-id" | "custom-domain",
  val: string,
) => {
  if (type === "id") return { id: val };
  if (type === "public-id") return { publicId: val };
  if (type === "custom-domain")
    return { customDomain: val.replace("https://", "") };
};

runScript(inspectTypebot);
