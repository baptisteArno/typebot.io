import { serve } from "inngest/next";
import { inngest } from "./client";
import {
  exportResults,
  sendExportedResultsToEmail,
} from "./functions/exportResults";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [exportResults, sendExportedResultsToEmail],
  streaming: "allow",
});
