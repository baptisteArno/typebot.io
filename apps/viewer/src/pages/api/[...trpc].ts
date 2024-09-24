import { appRouter } from "@/helpers/server/appRouter";
import { createContext } from "@/helpers/server/context";
import * as Sentry from "@sentry/nextjs";
import { createOpenApiNextHandler } from "@typebot.io/trpc-openapi/adapters";
import type { NextApiRequest, NextApiResponse } from "next";
import cors from "nextjs-cors";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore Not sure why the type is not properly inferred
  return createOpenApiNextHandler({
    router: appRouter,
    createContext,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore Not sure why the type is not properly inferred
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        Sentry.captureException(error);
        console.error("Something went wrong", error);
      }
    },
  })(req, res);
};

export default handler;
