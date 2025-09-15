import prisma from "@typebot.io/prisma";
import { JsonNull } from "@typebot.io/prisma/enum";
import type { ChatSession } from "../schemas";

export const upsertSession = (
  id: string,
  data: Partial<Omit<ChatSession, "id" | "createdAt" | "updatedAt">>,
) =>
  prisma.chatSession.upsert({
    where: { id },
    update: data,
    create: {
      ...data,
      state: data.state ?? JsonNull,
    },
  });
