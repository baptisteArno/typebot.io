import { isDefined } from "@typebot.io/lib/utils";
import { dequal } from "dequal";
import { useCallback, useRef, useState } from "react";

export interface Actions<T extends { updatedAt: Date }> {
  set: (newPresent: T | ((current: T) => T) | undefined) => void;
  setUpdateDate: (updateDate: Date) => void;
  undo: () => void;
  redo: () => void;
  flush: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface History<T extends { updatedAt: Date }> {
  past: T[];
  present: T | undefined;
  future: T[];
}

const initialState = {
  past: [],
  present: undefined,
  future: [],
};

type Params<T extends { updatedAt: Date }> = {
  isReadOnly?: boolean;
  onUndo?: (state: T) => void;
  onRedo?: (state: T) => void;
};

export const useUndo = <T extends { updatedAt: Date }>(
  initialPresent?: T,
  params?: Params<T>,
): [T | undefined, Actions<T>] => {
  const [history, setHistory] = useState<History<T>>(initialState);
  const presentRef = useRef<T | null>(initialPresent ?? null);

  const canUndo = history.past.length !== 0;
  const canRedo = history.future.length !== 0;

  const undo = useCallback(() => {
    if (params?.isReadOnly) return;
    const { past, present, future } = history;
    if (past.length === 0 || !present) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    const newPresent = { ...previous, updatedAt: present.updatedAt };

    setHistory({
      past: newPast,
      present: newPresent,
      future: [present, ...future],
    });
    presentRef.current = newPresent;
    if (params?.onUndo) params.onUndo(newPresent);
  }, [history, params]);

  const redo = useCallback(() => {
    if (params?.isReadOnly) return;
    const { past, present, future } = history;
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setHistory({
      past: present ? [...past, present] : past,
      present: next,
      future: newFuture,
    });
    presentRef.current = next;
    if (params?.onRedo) params.onRedo(next);
  }, [history, params]);

  const set = useCallback(
    (newPresentArg: T | ((current: T) => T) | undefined) => {
      const { past, present } = history;
      if (isDefined(present) && params?.isReadOnly) return;
      const newPresent =
        typeof newPresentArg === "function"
          ? newPresentArg(presentRef.current as T)
          : newPresentArg;
      if (
        newPresent &&
        present &&
        dequal(
          JSON.parse(JSON.stringify(newPresent)),
          JSON.parse(JSON.stringify(present)),
        )
      ) {
        return;
      }
      if (newPresent === undefined) {
        presentRef.current = null;
        setHistory(initialState);
        return;
      }
      setHistory({
        past: [...past, present].filter(isDefined),
        present: newPresent,
        future: [],
      });
      presentRef.current = newPresent;
    },
    [history, params?.isReadOnly],
  );

  const setUpdateDate = useCallback(
    (updatedAt: Date) => {
      set((current) =>
        current
          ? {
              ...current,
              updatedAt,
            }
          : current,
      );
    },
    [set],
  );

  const flush = useCallback(() => {
    if (params?.isReadOnly) return;
    setHistory({
      present: presentRef.current ?? undefined,
      past: [],
      future: [],
    });
  }, [params?.isReadOnly]);

  return [
    history.present,
    { set, undo, redo, flush, setUpdateDate, canUndo, canRedo },
  ];
};
