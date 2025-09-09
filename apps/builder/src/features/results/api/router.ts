import { router } from "@/helpers/server/trpc";
import { deleteResults } from "./deleteResults";
import { getResult } from "./getResult";
import { getResultLogs } from "./getResultLogs";
import { getResults } from "./getResults";
import { getResultTranscript } from "./getResultTranscript";

export const resultsRouter = router({
  getResults,
  getResult,
  getResultTranscript,
  deleteResults,
  getResultLogs,
});
