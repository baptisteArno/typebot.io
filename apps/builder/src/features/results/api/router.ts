import { deleteResults } from "./deleteResults";
import { getResult } from "./getResult";
import { getResultBlockFile } from "./getResultBlockFile";
import { getResultFile } from "./getResultFile";
import { getResultLogs } from "./getResultLogs";
import { getResults } from "./getResults";
import { getResultTranscript } from "./getResultTranscript";
import { triggerCancelExport } from "./triggerCancelExport";
import { triggerExportJob } from "./triggerExportJob";
import { triggerSendExportResultsToEmail } from "./triggerSendExportResultsToEmail";

export const resultsRouter = {
  getResults,
  getResult,
  getResultTranscript,
  getResultFile,
  getResultBlockFile,
  deleteResults,
  getResultLogs,
  triggerExportJob,
  triggerSendExportResultsToEmail,
  triggerCancelExport,
};
