import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
