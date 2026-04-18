import type { UserId } from "@typebot.io/shared-core/domain";

export type UserInOrpcContext = {
  id: UserId;
  email: string;
  // TODO: review package org
  groupTitlesAutoGeneration: any;
};

export function createContext({
  authenticate,
  req,
}: {
  authenticate: () => Promise<UserInOrpcContext | null>;
  req?: Request;
}) {
  return {
    authenticate,
    req,
  };
}

export type Context = ReturnType<typeof createContext>;
