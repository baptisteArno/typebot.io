import { askAssistantHandler } from "./askAssistantHandler";
import { createChatCompletionHandler } from "./createChatCompletionHandler";
import { createSpeechHandler } from "./createSpeechHandler";
import { createTranscriptionHandler } from "./createTranscriptionHandler";
import { generateVariablesHandler } from "./generateVariablesHandler";

export default [
  askAssistantHandler,
  createChatCompletionHandler,
  createSpeechHandler,
  createTranscriptionHandler,
  generateVariablesHandler,
];
