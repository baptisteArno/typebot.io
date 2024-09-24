import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export async function createContext(opts: CreateNextContextOptions) {
  const user = await getAuthenticatedUser(opts.req, opts.res);

  return {
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
