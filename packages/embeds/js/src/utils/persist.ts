// Copied from https://github.com/solidjs-community/solid-primitives/blob/main/packages/storage/src/types.ts
// Simplified version

import { defaultSettings } from "@typebot.io/settings/constants";
import type { Setter, Signal } from "solid-js";
import { untrack } from "solid-js";
import { reconcile } from "solid-js/store";
import { getStorage } from "./storage";

export type PersistParams<T> = {
  key: string;
  storage: "local" | "session" | undefined;
  transformInitDataFromStorage?: (data: any) => T;
  onRecovered?: () => void;
};

export function persist<T>(
  signal: Signal<T>,
  params: PersistParams<T>,
): [...Signal<T>] {
  if (!params.storage) return [...signal];

  const storage = getStorage(
    params.storage || defaultSettings.general.rememberUser.storage,
  );
  const serialize: (data: T) => string = (data: T) => {
    const clonedData = JSON.parse(JSON.stringify(data));

    if (typeof clonedData !== "object") return JSON.stringify(clonedData);

    if ("blobUrl" in clonedData) {
      clonedData.blobUrl = undefined;
    }

    if ("attachments" in clonedData && Array.isArray(clonedData.attachments)) {
      clonedData.attachments.forEach((attachment: any) => {
        if (attachment && "blobUrl" in attachment) {
          attachment.blobUrl = undefined;
        }
      });
    }

    return JSON.stringify(clonedData);
  };
  const deserialize: (data: string) => T = JSON.parse.bind(JSON);
  const init = storage.getItem(params.key);

  if (init) {
    const set =
      typeof signal[0] === "function"
        ? (data: any) => (signal[1] as any)(() => data)
        : (data: any) => (signal[1] as any)(reconcile(data));
    let parsedInit = deserialize(init);
    if (params.transformInitDataFromStorage) {
      parsedInit = params.transformInitDataFromStorage(parsedInit);
      storage.setItem(params.key, serialize(parsedInit));
    }
    set(parsedInit);
    params.onRecovered?.();
  }

  return [
    signal[0],
    typeof signal[0] === "function"
      ? (value?: T | ((prev: T) => T)) => {
          const output = (signal[1] as Setter<T>)(value as any);

          if (value) storage.setItem(params.key, serialize(output));
          else storage.removeItem(params.key);
          return output;
        }
      : (...args: any[]) => {
          (signal[1] as any)(...args);
          const value = serialize(untrack(() => signal[0] as any));
          storage.setItem(params.key, value);
        },
  ] as [...typeof signal];
}
