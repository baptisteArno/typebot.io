import { createContext } from "@/helpers/server/context";
import { appRouter } from "@/helpers/server/routers/appRouter";
import { createNextApiHandler } from "@trpc/server/adapters/next";

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
