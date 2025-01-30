import { defaultButtonLabel } from "../constants";
import type { TimeInputBlock } from "./schema";

export const defaultTimeInputOptions = {
  labels: {
    button: defaultButtonLabel,
  },
  format: "HH:mm",
} as const satisfies TimeInputBlock["options"];
