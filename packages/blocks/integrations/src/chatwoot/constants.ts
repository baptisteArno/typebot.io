import type { ChatwootBlock } from "./schema";

export const chatwootTasks = ["Show widget", "Close widget"] as const;

export const defaultChatwootOptions = {
  task: "Show widget",
  baseUrl: "https://app.chatwoot.com",
} as const satisfies ChatwootBlock["options"];
