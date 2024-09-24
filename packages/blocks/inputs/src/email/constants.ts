import { defaultButtonLabel } from "../constants";
import type { EmailInputBlock } from "./schema";

export const defaultEmailInputOptions = {
  labels: {
    button: defaultButtonLabel,
    placeholder: "Type your email...",
  },
  retryMessageContent:
    "This email doesn't seem to be valid. Can you type it again?",
} as const satisfies EmailInputBlock["options"];
