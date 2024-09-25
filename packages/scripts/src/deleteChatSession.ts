import * as p from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const deleteChatSession = async () => {
  await promptAndSetEnvironment("production");

  const id = await p.text({
    message: "Session ID?",
  });

  if (!id || typeof id !== "string") {
    console.log("No ID provided");
    return;
  }

  const chatSession = await prisma.chatSession.delete({
    where: {
      id,
    },
  });

  console.log(JSON.stringify(chatSession, null, 2));
};

deleteChatSession();
