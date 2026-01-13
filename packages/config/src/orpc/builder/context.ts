import type { ClientUser } from "@typebot.io/user/schemas";

export function createContext({
  authenticate,
}: {
  authenticate: () => Promise<ClientUser | null>;
}) {
  return {
    authenticate,
  };
}

export type Context = ReturnType<typeof createContext>;
