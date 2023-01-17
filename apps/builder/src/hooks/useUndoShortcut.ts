import { useEventListener } from '@chakra-ui/react'

export const useUndoShortcut = (undo: () => void) => {
  const isUndoShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === 'z'

  useEventListener('keydown', (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    const isTyping =
      target?.role === 'textbox' ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLInputElement
    if (isTyping) return
    if (isUndoShortcut(event)) {
      undo()
    }
  })
}
