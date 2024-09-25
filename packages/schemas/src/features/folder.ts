import type { Prisma } from "@typebot.io/prisma/types";
import { z } from "@typebot.io/zod";

export const folderSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  parentFolderId: z.string().nullable(),
  workspaceId: z.string(),
}) satisfies z.ZodType<Prisma.DashboardFolder>;

export type Folder = z.infer<typeof folderSchema>;
