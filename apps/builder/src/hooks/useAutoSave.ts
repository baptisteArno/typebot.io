import { useEffect } from 'react'
import { useDebounce } from 'use-debounce'

export const useAutoSave = <T>(
  {
    handler,
    item,
    debounceTimeout,
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: () => Promise<any>
    item?: T
    debounceTimeout: number
  },
  dependencies: unknown[]
) => {
  const [debouncedItem] = useDebounce(item, debounceTimeout)

  useEffect(() => {
    const save = () => handler()
    document.addEventListener('visibilitychange', save)
    return () => {
      document.removeEventListener('visibilitychange', save)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return useEffect(() => {
    handler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedItem])
}
