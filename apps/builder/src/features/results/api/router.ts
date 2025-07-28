import { router } from "@/helpers/server/trpc";
import { deleteResults } from "./deleteResults";
import { getResult } from "./getResult";
import { getResultLogs } from "./getResultLogs";
import { getResultTranscript } from "./getResultTranscript";
import { getResults } from "./getResults";

export const resultsRouter = router({
  getResults,
  getResult,
  getResultTranscript,
  deleteResults,
  getResultLogs,
});
