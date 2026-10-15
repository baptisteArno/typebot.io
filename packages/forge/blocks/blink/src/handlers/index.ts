import { getUsersHandler } from "./getUsersHandler";
import { redirectHandler } from "./redirectHandler";
import { sendChatMessageHandler } from "./sendChatMessageHandler";
import { sendFeedEventHandler } from "./sendFeedEventHandler";

export default [
  getUsersHandler,
  sendFeedEventHandler,
  sendChatMessageHandler,
  redirectHandler,
];
