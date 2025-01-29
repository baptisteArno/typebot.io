import { defaultButtonLabel } from "../constants";
import type { TimeInputBlock } from "./schema";

export const defaultTimeInputOptions = {
  labels: {
    button: defaultButtonLabel,
  },
} as const satisfies TimeInputBlock["options"];
