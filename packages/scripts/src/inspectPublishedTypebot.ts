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
    ],
  });

  const typebot = await prisma.typebot.findFirst({
    where: {
      [type === "public-id" ? "publicId" : type]: value,
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

runScript(inspectTypebot);
