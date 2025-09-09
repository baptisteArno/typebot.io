import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";

export const createContext = async (opts: CreateNextContextOptions) => {
  const user = await getAuthenticatedUser(opts.req, opts.res);

  return {
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
