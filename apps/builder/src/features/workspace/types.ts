import type { Prisma } from "@typebot.io/prisma/types";

export type Member = Prisma.MemberInWorkspace & {
  name: string | null;
  image: string | null;
  email: string | null;
};
