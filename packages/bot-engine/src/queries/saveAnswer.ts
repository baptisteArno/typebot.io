import type { SessionState } from "@typebot.io/chat-session/schemas";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";

type Props = {
  answer: Omit<Prisma.Prisma.AnswerV2CreateManyInput, "resultId">;
  state: SessionState;
};
const maxAnswerContentByteLength = 65_535;

export const saveAnswer = async ({ answer, state }: Props) => {
  const resultId = state.typebotsQueue[0].resultId;
  if (!resultId) return;
  const textEncoder = new TextEncoder();
  let content = answer.content;

  if (
    process.env.DATABASE_URL?.startsWith("mysql://") &&
    textEncoder.encode(content).length > maxAnswerContentByteLength
  ) {
    let byteLength = 0;
    let contentEndIndex = 0;

    for (const character of content) {
      const characterByteLength = textEncoder.encode(character).length;
      if (byteLength + characterByteLength > maxAnswerContentByteLength) break;
      byteLength += characterByteLength;
      contentEndIndex += character.length;
    }

    content = content.slice(0, contentEndIndex);
  }

  return prisma.answerV2.createMany({
    data: [{ ...answer, content, resultId }],
  });
};
