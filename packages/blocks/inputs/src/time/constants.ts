import { defaultButtonLabel } from "../constants";
import type { TimeInputBlock } from "./schema";

export const defaultTimeInputOptions = {
  twentyFourHourTime: false,
  labels: {
    button: defaultButtonLabel,
    placeholder: "Send",
  },
} as const satisfies TimeInputBlock["options"];
