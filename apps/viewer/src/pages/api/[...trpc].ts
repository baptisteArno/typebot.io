import type { NextApiRequest, NextApiResponse } from "next";
import cors from "nextjs-cors";
import { createOpenApiNextHandler } from "trpc-to-openapi";
import { appRouter } from "@/helpers/server/appRouter";
import { createContext } from "@/helpers/server/context";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  return createOpenApiNextHandler({
    router: appRouter,
    createContext,
  })(req, res);
};

export default handler;
