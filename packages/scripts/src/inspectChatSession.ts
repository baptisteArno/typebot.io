import { sessionStateSchema } from "@typebot.io/chat-session/schemas";
import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  getRequiredInput,
  runScript,
} from "./cli";

const inspectChatSession = async () => {
  assertProductionEnvironment();

  const id = await getRequiredInput({
    message: "Session ID?",
    name: "session-id",
  });

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

  const resultId = sessionStateSchema.parse(chatSession.state).typebotsQueue[0]
    ?.resultId;
  if (!resultId) {
    console.log("Session has no result");
    return;
  }

  const result = await prisma.result.findFirst({
    where: {
      id: resultId,
    },
  });

  console.log({
    result,
  });
};

runScript(inspectChatSession);
