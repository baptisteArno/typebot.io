import { isNotEmpty } from "@typebot.io/lib/utils";
import { useCallback, useEffect } from "react";

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
    cmdPlusKey("z", { event }) && !event.shiftKey;

  const isRedoShortcut = (event: KeyboardEvent) =>
    cmdPlusKey("z", { event }) && event.shiftKey;

  const isCopyShortcut = (event: KeyboardEvent) => cmdPlusKey("c", { event });

  const isPasteShortcut = (event: KeyboardEvent) => cmdPlusKey("v", { event });

  const isCutShortcut = (event: KeyboardEvent) => cmdPlusKey("x", { event });

  const isDuplicateShortcut = (event: KeyboardEvent) =>
    cmdPlusKey("d", { event });

  const isSelectAllShortcut = (event: KeyboardEvent) =>
    cmdPlusKey("a", { event });

  const isBackspaceShortcut = (event: KeyboardEvent) =>
    event.key === "Backspace";

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
    },
    [undo, redo, copy, paste, cut, duplicate, backspace, selectAll],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
};

const cmdPlusKey = (key: string, { event }: { event: KeyboardEvent }) => {
  const modifierPressed = event.metaKey || event.ctrlKey;
  return modifierPressed && event.key === key;
};
