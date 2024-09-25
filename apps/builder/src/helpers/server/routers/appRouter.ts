import { mergeRouters } from "../trpc";
import { internalRouter } from "./internalRouter";
import { publicRouter } from "./publicRouter";

export const appRouter = mergeRouters(internalRouter, publicRouter);

export type AppRouter = typeof appRouter;
