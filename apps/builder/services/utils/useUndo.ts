import { isDefined } from '@udecode/plate-core'
import { deepEqual } from 'fast-equals'
// import { diff } from 'deep-object-diff'
import { useReducer, useCallback, useRef } from 'react'
import { isNotDefined } from 'utils'

enum ActionType {
  Undo = 'UNDO',
  Redo = 'REDO',
  Set = 'SET',
}

export interface Actions<T> {
  set: (newPresent: T) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  presentRef: React.MutableRefObject<T>
}

interface Action<T> {
  type: ActionType
  newPresent?: T
}

export interface State<T> {
  past: T[]
  present: T
  future: T[]
}

const initialState = {
  past: [],
  present: null,
  future: [],
}

const reducer = <T>(state: State<T>, action: Action<T>) => {
  const { past, present, future } = state

  switch (action.type) {
    case ActionType.Undo: {
      if (past.length === 0) {
        return state
      }

      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)

      return {
        past: newPast,
        present: previous,
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
          deepEqual(
            JSON.parse(JSON.stringify(newPresent)),
            JSON.parse(JSON.stringify(present))
          ))
      ) {
        return state
      }
      // Uncomment to debug history ⬇️
      // console.log(
      //   diff(
      //     JSON.parse(JSON.stringify(newPresent)),
      //     JSON.parse(JSON.stringify(present))
      //   )
      // )
      return {
        past: [...past, present].filter(isDefined),
        present: newPresent,
        future: [],
      }
    }
  }
}

const useUndo = <T>(initialPresent: T): [State<T>, Actions<T>] => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    present: initialPresent,
  }) as [State<T>, React.Dispatch<Action<T>>]
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
  const set = useCallback((newPresent: T) => {
    presentRef.current = newPresent
    dispatch({ type: ActionType.Set, newPresent })
  }, [])

  return [state, { set, undo, redo, canUndo, canRedo, presentRef }]
}

export default useUndo
