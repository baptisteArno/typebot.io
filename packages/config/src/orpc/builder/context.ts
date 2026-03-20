import type { UserId } from "@typebot.io/shared-core/domain";

export type UserInOrpcContext = {
  id: UserId;
  email: string;
  // TODO: review package org
  groupTitlesAutoGeneration: any;
};

export function createContext({
  authenticate,
}: {
  authenticate: () => Promise<UserInOrpcContext | null>;
}) {
  return {
    authenticate,
  };
}

export type Context = ReturnType<typeof createContext>;
