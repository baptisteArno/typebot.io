import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "zod";
import { getTestWebhookRoom } from "./getTestWebhookRoom";
import { publishWebhook } from "./publishWebhook";

export const executeTestWebhookInputSchema = z.object({
  params: z.object({
    typebotId: z.string(),
    blockId: z.string(),
  }),
  body: z.unknown(),
});

type Context = {
  user: Pick<Prisma.User, "email" | "id">;
};

export const handleExecuteTestWebhook = async ({
  input: {
    params: { typebotId, blockId },
    body,
  },
  context: { user },
}: {
  input: z.infer<typeof executeTestWebhookInputSchema>;
  context: Context;
}) => {
  const room = await getTestWebhookRoom(typebotId, blockId, user);
  await publishWebhook(room, blockId, body);
  return { message: "OK" };
};
