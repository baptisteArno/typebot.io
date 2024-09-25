import { defaultButtonLabel } from "../constants";
import type { RatingInputBlock } from "./schema";

export const defaultRatingInputOptions = {
  buttonType: "Numbers",
  length: 10,
  labels: {
    button: defaultButtonLabel,
  },
  startsAt: 0,
  customIcon: { isEnabled: false },
  isOneClickSubmitEnabled: false,
} as const satisfies RatingInputBlock["options"];
