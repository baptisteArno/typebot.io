import { useEventListener } from '@chakra-ui/react'

export const useUndoShortcut = (canUndo: boolean, undo: () => void) => {
  const isUndoShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === 'z'

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (isUndoShortcut(event) && canUndo) {
      undo()
    }
  })
}
