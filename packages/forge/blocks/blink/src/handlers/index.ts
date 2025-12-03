import { getUsersHandler } from "./getUsersHandler";
import { redirectHandler } from "./redirectHandler";
import { sendFeedEventHandler } from "./sendFeedEventHandler";

export default [getUsersHandler, sendFeedEventHandler, redirectHandler];
