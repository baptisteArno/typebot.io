import * as p from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const inspectChatSession = async () => {
  await promptAndSetEnvironment("production");

  const id = await p.text({
    message: "Session ID?",
  });

  if (!id || typeof id !== "string") {
    console.log("No ID provided");
    return;
  }

  const chatSession = await prisma.chatSession.findFirst({
    where: {
      id,
    },
    select: {
      state: true,
    },
  });

  if (!chatSession) {
    console.log("Session not found");
    return;
  }

  const result = await prisma.result.findFirst({
    where: {
      id: (chatSession.state as any).typebotsQueue[0].resultId,
    },
  });

  console.log({
    result,
  });
};

inspectChatSession();
