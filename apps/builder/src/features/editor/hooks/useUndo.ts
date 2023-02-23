import { isDefined } from '@udecode/plate-core'
import { dequal } from 'dequal'
// import { diff } from 'deep-object-diff'
import { useReducer, useCallback, useRef } from 'react'
import { isNotDefined } from 'utils'

enum ActionType {
  Undo = 'UNDO',
  Redo = 'REDO',
  Set = 'SET',
  Flush = 'FLUSH',
}

export interface Actions<T extends { updatedAt: Date } | undefined> {
  set: (
    newPresent: T | ((current: T) => T),
    options?: { updateDate: boolean }
  ) => void
  undo: () => void
  redo: () => void
  flush: () => void
  canUndo: boolean
  canRedo: boolean
  presentRef: React.MutableRefObject<T>
}

interface Action<T extends { updatedAt: Date } | undefined> {
  type: ActionType
  newPresent?: T
  updateDate?: boolean
}

export interface State<T extends { updatedAt: Date } | undefined> {
  past: T[]
  present: T
  future: T[]
}

const initialState = {
  past: [],
  present: null,
  future: [],
}

const reducer = <T extends { updatedAt: Date } | undefined>(
  state: State<T>,
  action: Action<T>
) => {
  const { past, present, future } = state

  switch (action.type) {
    case ActionType.Undo: {
      if (past.length === 0 || !present) {
        return state
      }

      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)

      return {
        past: newPast,
        present: { ...previous, updatedAt: present.updatedAt },
        future: [present, ...future],
      }
    }

    case ActionType.Redo: {
      if (future.length === 0) {
        return state
      }
      const next = future[0]
      const newFuture = future.slice(1)

      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      }
    }

    case ActionType.Set: {
      const { newPresent } = action
      if (
        isNotDefined(newPresent) ||
        (present &&
          dequal(
            JSON.parse(JSON.stringify(newPresent)),
            JSON.parse(JSON.stringify(present))
          ))
      ) {
        return state
      }

      return {
        past: [...past, present].filter(isDefined),
        present: newPresent,
        future: [],
      }
    }

    case ActionType.Flush:
      return { ...initialState, present }
  }
}

const useUndo = <T extends { updatedAt: Date } | undefined>(
  initialPresent: T
): [State<T>, Actions<T>] => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    present: initialPresent,
  })
  const presentRef = useRef<T>(initialPresent)

  const canUndo = state.past.length !== 0
  const canRedo = state.future.length !== 0

  const undo = useCallback(() => {
    if (canUndo) {
      dispatch({ type: ActionType.Undo })
    }
  }, [canUndo])

  const redo = useCallback(() => {
    if (canRedo) {
      dispatch({ type: ActionType.Redo })
    }
  }, [canRedo])

  const set = useCallback((newPresent: T | ((current: T) => T)) => {
    const updatedTypebot =
      newPresent && typeof newPresent === 'function'
        ? newPresent(presentRef.current)
        : newPresent
    presentRef.current = updatedTypebot
    dispatch({
      type: ActionType.Set,
      newPresent: updatedTypebot,
    })
  }, [])

  const flush = useCallback(() => {
    dispatch({ type: ActionType.Flush })
  }, [])

  return [
    state as State<T>,
    { set, undo, redo, flush, canUndo, canRedo, presentRef },
  ]
}

export default useUndo
