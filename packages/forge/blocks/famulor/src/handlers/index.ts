import { fetchAssistantsHandler } from "./fetchAssistantsHandler";
import { fetchPhoneNumbersHandler } from "./fetchPhoneNumbersHandler";
import { getCallHandler } from "./getCallHandler";
import { startCallHandler } from "./startCallHandler";

export default [
  startCallHandler,
  fetchAssistantsHandler,
  fetchPhoneNumbersHandler,
  getCallHandler,
];
