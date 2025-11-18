import { router } from "@/helpers/server/trpc";
import { deleteResults } from "./deleteResults";
import { getResult } from "./getResult";
import { getResultLogs } from "./getResultLogs";
import { getResults } from "./getResults";
import { getResultTranscript } from "./getResultTranscript";
import { triggerCancelExport } from "./triggerCancelExport";
import { triggerExportJob } from "./triggerExportJob";
import { triggerSendExportResultsToEmail } from "./triggerSendExportResultsToEmail";

export const resultsRouter = router({
  getResults,
  getResult,
  getResultTranscript,
  deleteResults,
  getResultLogs,
  triggerExportJob,
  triggerSendExportResultsToEmail,
  triggerCancelExport,
});
