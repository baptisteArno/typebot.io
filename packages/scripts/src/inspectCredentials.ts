import * as p from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const inspectCredentials = async () => {
  await promptAndSetEnvironment("production");

  const id = await p.text({
    message: "Credentials ID?",
  });

  if (!id || typeof id !== "string") {
    console.log("No ID provided");
    return;
  }

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

inspectCredentials();
