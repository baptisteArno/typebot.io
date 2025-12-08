import {
  askAssistantHandler,
  fetchAssistantFunctionsHandler,
  fetchAssistantsHandler,
} from "./askAssistantHandler";
import { createChatCompletionHandler } from "./createChatCompletionHandler";
import {
  createSpeechHandler,
  fetchSpeechModelsHandler,
} from "./createSpeechHandler";
import { createTranscriptionHandler } from "./createTranscriptionHandler";
import { generateVariablesHandler } from "./generateVariablesHandler";

export default [
  askAssistantHandler,
  fetchAssistantsHandler,
  fetchAssistantFunctionsHandler,
  createChatCompletionHandler,
  createSpeechHandler,
  fetchSpeechModelsHandler,
  createTranscriptionHandler,
  generateVariablesHandler,
];
