import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const deleteChatSession = async () => {
  assertProductionEnvironment();

  const id = await getRequiredInput({
    message: "Session ID?",
    name: "session-id",
  });

  if (
    !(await confirmAction({
      message: `Delete production chat session ${id}?`,
    }))
  )
    return;

  const chatSession = await prisma.chatSession.delete({
    where: {
      id,
    },
  });

  console.log(JSON.stringify(chatSession, null, 2));
};

runScript(deleteChatSession);
