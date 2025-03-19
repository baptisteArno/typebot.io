import {
  NumberInputStyle,
  defaultNumberInputStyle,
} from "@typebot.io/blocks-inputs/number/constants";
import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";

export const parseFormatOptions = (
  options: NumberInputBlock["options"],
): Intl.NumberFormatOptions => {
  const defaultFormat = {
    style: defaultNumberInputStyle,
  };
  if (options?.style === NumberInputStyle.CURRENCY && options.currency)
    return {
      style: options.style,
      currency: options.currency,
    };
  if (options?.style === NumberInputStyle.UNIT && options.unit)
    return {
      style: options.style,
      unit: options.unit,
    };
  return defaultFormat;
};
