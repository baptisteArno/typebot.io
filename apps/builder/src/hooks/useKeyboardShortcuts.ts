import { isNotEmpty } from "@typebot.io/lib/utils";
import { useEventListener } from "./useEventListener";

const typebotBotPreviewTagName = "TYPEBOT-STANDARD";
const typebotSupportBotTagName = "TYPEBOT-BUBBLE";

type Props = {
  undo?: () => void;
  redo?: () => void;
  copy?: () => void;
  paste?: () => void;
  cut?: () => void;
  duplicate?: () => void;
  backspace?: () => void;
  selectAll?: () => void;
};

export const useKeyboardShortcuts = ({
  undo,
  redo,
  copy,
  paste,
  cut,
  duplicate,
  backspace,
  selectAll,
}: Props) => {
  const isUndoShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === "z" && !event.shiftKey;

  const isRedoShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === "z" && event.shiftKey;

  const isCopyShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === "c";

  const isPasteShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === "v";

  const isCutShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === "x";

  const isDuplicateShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === "d";

  const isSelectAllShortcut = (event: KeyboardEvent) =>
    (event.metaKey || event.ctrlKey) && event.key === "a";

  const isBackspaceShortcut = (event: KeyboardEvent) =>
    event.key === "Backspace";

  useEventListener("keydown", (event: KeyboardEvent) => {
    if (!event.metaKey && !event.ctrlKey && event.key !== "Backspace") return;
    const textSelection = window.getSelection()?.toString();
    if (isNotEmpty(textSelection)) return;
    const target = event.target as HTMLElement | null;
    const isTyping =
      target?.role === "textbox" ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLInputElement;
    if (
      isTyping ||
      target?.tagName === typebotBotPreviewTagName ||
      target?.tagName === typebotSupportBotTagName
    )
      return;
    if (undo && isUndoShortcut(event)) {
      event.preventDefault();
      undo();
      return;
    }
    if (redo && isRedoShortcut(event)) {
      event.preventDefault();
      redo();
      return;
    }
    if (copy && isCopyShortcut(event)) {
      event.preventDefault();
      copy();
      return;
    }
    if (paste && isPasteShortcut(event)) {
      event.preventDefault();
      paste();
      return;
    }
    if (cut && isCutShortcut(event)) {
      event.preventDefault();
      cut();
      return;
    }
    if (duplicate && isDuplicateShortcut(event)) {
      event.preventDefault();
      duplicate();
      return;
    }
    if (backspace && isBackspaceShortcut(event)) {
      event.preventDefault();
      backspace();
      return;
    }
    if (selectAll && isSelectAllShortcut(event)) {
      event.preventDefault();
      selectAll();
      return;
    }
  });
};
