import { createNextApiHandler } from "@trpc/server/adapters/next";
import { createContext } from "@/helpers/server/context";
import { appRouter } from "@/helpers/server/routers/appRouter";

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
