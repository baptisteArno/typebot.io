import { createContext } from "@/helpers/server/context";
import { publicRouter } from "@/helpers/server/routers/publicRouter";
import * as Sentry from "@sentry/nextjs";
import { createOpenApiNextHandler } from "@typebot.io/trpc-openapi/adapters";
import type { NextApiRequest, NextApiResponse } from "next";
import cors from "nextjs-cors";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res, {
    origin: ["https://docs.typebot.io", "http://localhost:3000"],
  });

  return createOpenApiNextHandler({
    router: publicRouter,
    createContext,
    onError({ error }: { error: { code: string } }): void {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        Sentry.captureException(error);
        console.error("Something went wrong", error);
      }
    },
  })(req, res);
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};

export default handler;
