import {
  askAssistantHandler,
  fetchAssistantFunctionsHandler,
  fetchAssistantsHandler,
} from "./askAssistantHandler";
import { askModelHandler } from "./askModelHandler";
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
  askModelHandler,
  createChatCompletionHandler,
  createSpeechHandler,
  fetchSpeechModelsHandler,
  createTranscriptionHandler,
  generateVariablesHandler,
];
