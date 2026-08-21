import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  getRequiredInput,
  runScript,
} from "./cli";

const inspectCredentials = async () => {
  assertProductionEnvironment();

  const id = await getRequiredInput({
    message: "Credentials ID?",
    name: "credentials-id",
  });

  const credentials = await prisma.credentials.findFirst({
    where: {
      id,
    },
    select: {
      name: true,
      workspaceId: true,
    },
  });

  console.log({
    credentials,
  });
};

runScript(inspectCredentials);
