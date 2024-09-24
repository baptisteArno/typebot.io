import { webhookHandler } from "@typebot.io/billing/api/webhookHandler";
import Cors from "micro-cors";
import type { RequestHandler } from "next/dist/server/next";

const cors = Cors({
  allowMethods: ["POST", "HEAD"],
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default cors(webhookHandler as RequestHandler);
