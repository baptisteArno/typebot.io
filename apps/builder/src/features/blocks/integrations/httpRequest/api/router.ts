import { router } from "@/helpers/server/trpc";
import { getResultExample } from "./getResultExample";
import { listHttpRequestBlocks } from "./listHttpRequestBlocks";
import { subscribeHttpRequest } from "./subscribeHttpRequest";
import { unsubscribeHttpRequest } from "./unsubscribeHttpRequest";

export const httpRequestRouter = router({
  listHttpRequestBlocks,
  getResultExample,
  subscribeHttpRequest,
  unsubscribeHttpRequest,
});
