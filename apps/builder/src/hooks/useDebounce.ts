import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

const defaultDebounceTimeout = 1000;

export const useDebounce = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  debounceTimeout = defaultDebounceTimeout,
) => {
  const debouncedFn = useDebouncedCallback(fn, debounceTimeout);

  useEffect(
    () => () => {
      debouncedFn.flush();
    },
    [debouncedFn],
  );

  return debouncedFn;
};
