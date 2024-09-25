import type { Prisma } from "@typebot.io/prisma/types";

export type Collaborator = Prisma.CollaboratorsOnTypebots & {
  user: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
};
