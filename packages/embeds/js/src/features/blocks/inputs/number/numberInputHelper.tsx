import { createEffect, untrack } from "solid-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const numberInputHelper = (value: () => any) => {
  const bindDirective = (el: HTMLInputElement) => {
    createEffect(() => {
      const v = value();
      if (v == null) {
        el.value = v;
        return;
      }

      const nodeV = el.value;
      if ((v === 0 && nodeV === "") || v !== nodeV) {
        el.value = v + "";
      }
    });
  };
  const targetValue = (el: HTMLInputElement) => {
    if (el.validity.badInput) {
      return value();
    }

    if (el.value === "") {
      return undefined;
    }

    return el.valueAsNumber;
  };

  return [untrack(value), bindDirective, targetValue];
};
