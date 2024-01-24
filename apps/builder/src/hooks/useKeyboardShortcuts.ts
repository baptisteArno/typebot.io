import { useEventListener } from './useEventListener'

type Props = {
  undo?: () => void
  redo?: () => void
  copy?: () => void
  paste?: () => void
  cut?: () => void
  backspace?: () => void
}
export const useKeyboardShortcuts = ({
  undo,
  redo,
  copy,
  paste,
  cut,
  backspace,
}: Props) => {
  const isUndoShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey

  const isRedoShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === 'z' && event.shiftKey

  const isCopyShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === 'c'

  const isPasteShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === 'v'

  const isCutShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === 'x'

  const isBackspaceShortcut = (event: KeyboardEvent) =>
    event.key === 'Backspace'

  useEventListener('keydown', (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    const isTyping =
      target?.role === 'textbox' ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLInputElement
    if (isTyping) return
    if (undo && isUndoShortcut(event)) {
      event.preventDefault()
      undo()
    }
    if (redo && isRedoShortcut(event)) {
      event.preventDefault()
      redo()
    }
    if (copy && isCopyShortcut(event)) {
      event.preventDefault()
      copy()
    }
    if (paste && isPasteShortcut(event)) {
      event.preventDefault()
      paste()
    }
    if (cut && isCutShortcut(event)) {
      event.preventDefault()
      cut()
    }
    if (backspace && isBackspaceShortcut(event)) {
      event.preventDefault()
      backspace()
    }
  })
}
