import { getResultExample } from "./getResultExample";
import { listHttpRequestBlocks } from "./listHttpRequestBlocks";
import { subscribeHttpRequest } from "./subscribeHttpRequest";
import { testHttpRequest } from "./testHttpRequest";
import { unsubscribeHttpRequest } from "./unsubscribeHttpRequest";

export const httpRequestRouter = {
  listHttpRequestBlocks,
  getResultExample,
  subscribeHttpRequest,
  unsubscribeHttpRequest,
  testHttpRequest,
};
