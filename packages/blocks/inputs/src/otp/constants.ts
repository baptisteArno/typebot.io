import { defaultButtonLabel } from "../constants";
import type { OtpInputBlock } from "./schema";

export const defaultTextInputOptions = {
  codeLength: 4,
  labels: { button: defaultButtonLabel },
} as const satisfies OtpInputBlock["options"];
