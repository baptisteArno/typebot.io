import type { NumberInputStyle } from "@typebot.io/blocks-inputs/number/constants";

export const parseNumber = (
  value: string,
  options?: {
    locale?: string;
    style?: NumberInputStyle;
    currency?: string;
    unit?: string;
  },
) => {
  if (value.startsWith("0")) return value;

  return Intl.NumberFormat(options?.locale, {
    style: options?.style,
    currency: options?.currency,
    unit: options?.unit,
  }).format(Number.parseFloat(value));
};
