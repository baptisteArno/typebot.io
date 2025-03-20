import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

const defaultDebounceTimeout = 1000;

export const useDebounce = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
) => {
  const debouncedFn = useDebouncedCallback(fn, defaultDebounceTimeout);

  useEffect(
    () => () => {
      debouncedFn.flush();
    },
    [debouncedFn],
  );

  return debouncedFn;
};
