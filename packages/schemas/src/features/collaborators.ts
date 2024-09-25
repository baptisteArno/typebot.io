import { CollaborationType } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "@typebot.io/zod";

export const collaboratorSchema = z.object({
  type: z.nativeEnum(CollaborationType),
  userId: z.string(),
  typebotId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<Prisma.CollaboratorsOnTypebots>;
