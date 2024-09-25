import { defaultButtonLabel } from "../constants";
import type { NumberInputBlock } from "./schema";

export const defaultNumberInputOptions = {
  labels: { button: defaultButtonLabel, placeholder: "Type a number..." },
} as const satisfies NumberInputBlock["options"];
