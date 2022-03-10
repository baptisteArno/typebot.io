import { useEffect, useRef, useState } from 'react'

export const useRefState = (initialValue: string) => {
  const [state, setState] = useState(initialValue)
  const stateRef = useRef<string>(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])
  return [stateRef, setState]
}
