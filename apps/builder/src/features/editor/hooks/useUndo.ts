import { dequal } from 'dequal'
import { useCallback, useRef, useState } from 'react'
import { isDefined } from '@typebot.io/lib'

export interface Actions<T extends { updatedAt: Date }> {
  set: (newPresent: T | ((current: T) => T) | undefined) => void
  undo: () => void
  redo: () => void
  flush: () => void
  canUndo: boolean
  canRedo: boolean
}

export interface History<T extends { updatedAt: Date }> {
  past: T[]
  present: T | undefined
  future: T[]
}

const initialState = {
  past: [],
  present: undefined,
  future: [],
}

export const useUndo = <T extends { updatedAt: Date }>(
  initialPresent?: T
): [T | undefined, Actions<T>] => {
  const [history, setHistory] = useState<History<T>>(initialState)
  const presentRef = useRef<T | null>(initialPresent ?? null)

  const canUndo = history.past.length !== 0
  const canRedo = history.future.length !== 0

  const undo = useCallback(() => {
    const { past, present, future } = history
    if (past.length === 0 || !present) return

    const previous = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)

    const newPresent = { ...previous, updatedAt: present.updatedAt }

    setHistory({
      past: newPast,
      present: newPresent,
      future: [present, ...future],
    })
    presentRef.current = newPresent
  }, [history])

  const redo = useCallback(() => {
    const { past, present, future } = history
    if (future.length === 0) return
    const next = future[0]
    const newFuture = future.slice(1)

    setHistory({
      past: present ? [...past, present] : past,
      present: next,
      future: newFuture,
    })
    presentRef.current = next
  }, [history])

  const set = useCallback(
    (newPresentArg: T | ((current: T) => T) | undefined) => {
      const { past, present } = history
      const newPresent =
        typeof newPresentArg === 'function'
          ? newPresentArg(presentRef.current as T)
          : newPresentArg
      if (
        newPresent &&
        present &&
        dequal(
          JSON.parse(JSON.stringify(newPresent)),
          JSON.parse(JSON.stringify(present))
        )
      ) {
        return
      }
      if (newPresent === undefined) {
        presentRef.current = null
        setHistory(initialState)
        return
      }
      setHistory({
        past: [...past, present].filter(isDefined),
        present: newPresent,
        future: [],
      })
      presentRef.current = newPresent
    },
    [history]
  )

  const flush = useCallback(() => {
    setHistory({
      present: presentRef.current ?? undefined,
      past: [],
      future: [],
    })
  }, [])

  return [history.present, { set, undo, redo, flush, canUndo, canRedo }]
}
