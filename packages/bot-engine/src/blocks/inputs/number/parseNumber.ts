import { NumberInputStyle } from "@typebot.io/blocks-inputs/number/constants";

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

  const hasMissingCurrency =
    options?.style === NumberInputStyle.CURRENCY && !options?.currency;

  return Intl.NumberFormat(options?.locale, {
    style: hasMissingCurrency ? NumberInputStyle.DECIMAL : options?.style,
    currency: options?.currency,
    unit: options?.unit,
  }).format(Number.parseFloat(value));
};
