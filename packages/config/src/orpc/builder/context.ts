import type { UserId } from "@typebot.io/shared-core/domain";

export type UserInOrpcContext = {
  id: UserId;
  email: string;
  // TODO: review package org
  groupTitlesAutoGeneration: any;
};

export function createContext({
  req,
  authenticate,
}: {
  req?: Request;
  authenticate: () => Promise<UserInOrpcContext | null>;
}) {
  return {
    apiOrigin: req ? new URL(req.url).origin : undefined,
    authenticate,
  };
}

export type Context = ReturnType<typeof createContext>;
