import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

export const useDebounce = <Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  debounceTimeout: number,
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
