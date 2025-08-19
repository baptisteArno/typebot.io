import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { useOpenControls } from "@/hooks/useOpenControls";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { editorStyle } from "@/lib/plate";
import { Stack, useColorModeValue } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { colors } from "@typebot.io/ui/chakraTheme";
import { Popover } from "@typebot.io/ui/components/Popover";
import type { Variable } from "@typebot.io/variables/schemas";
import { focusEditor, insertText, selectEditor } from "@udecode/plate-common";
import { PlateContent, useEditorRef } from "@udecode/plate-core";
import { useRef, useState } from "react";
import { TextEditorToolBar } from "./TextEditorToolBar";

type Props = {
  closeEditor: () => void;
};
export const TextEditorEditorContent = ({ closeEditor }: Props) => {
  const { t } = useTranslate();
  const editor = useEditorRef();
  const variablesPopoverControls = useOpenControls();
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const [variablePopoverAnchorCoords, setVariablePopoverAnchorCoords] =
    useState<{ top: number; left: number } | null>({ top: 0, left: 0 });

  const rememberedSelection = useRef<typeof editor.selection | null>(null);
  const textEditorRef = useRef<HTMLDivElement>(null);
  const plateContentRef = useRef<HTMLDivElement>(null);

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return;
    variablesPopoverControls.onClose();
    focusEditor(editor);
    insertText(editor, "{{" + variable.name + "}}");
  };

  useOutsideClick({
    ref: textEditorRef,
    handler: closeEditor,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.shiftKey) return;
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) closeEditor();
  };

  const openVariablePopover = () => {
    if (rememberedSelection.current) return { top: 0, left: 0 };
    const selection = window.getSelection();
    const relativeParent = textEditorRef.current;
    if (!selection || !relativeParent) return { top: 0, left: 0 };
    const range = selection.getRangeAt(0);
    const selectionBoundingRect = range.getBoundingClientRect();
    const relativeRect = relativeParent.getBoundingClientRect();
    setVariablePopoverAnchorCoords({
      top: selectionBoundingRect.bottom - relativeRect.top,
      left: selectionBoundingRect.left - relativeRect.left,
    });
    variablesPopoverControls.onOpen();
  };

  return (
    <Stack
      flex="1"
      ref={textEditorRef}
      borderWidth="2px"
      borderColor={useColorModeValue("orange.400", "orange.300")}
      rounded="md"
      pos="relative"
      spacing={0}
      cursor="text"
      className="prevent-group-drag"
      onContextMenuCapture={(e) => e.stopPropagation()}
      sx={{
        ".slate-ToolbarButton-active": {
          color: useColorModeValue("blue.500", "blue.300") + " !important",
        },
        '[class^="PlateFloatingLink___Styled"]': {
          "--tw-bg-opacity": useColorModeValue("1", ".1") + "!important",
          backgroundColor: useColorModeValue("white", "gray.900"),
          borderRadius: "md",
          transitionProperty: "background-color",
          transitionDuration: "normal",
        },
        '[class^="FloatingVerticalDivider___"]': {
          "--tw-bg-opacity": useColorModeValue("1", ".4") + "!important",
        },
        ".slate-a": {
          color: useColorModeValue("blue.500", "blue.300"),
        },
      }}
    >
      <TextEditorToolBar onVariablesButtonClick={openVariablePopover} />
      <PlateContent
        ref={plateContentRef}
        onKeyDown={handleKeyDown}
        style={editorStyle(useColorModeValue("white", colors.gray[900]))}
        autoFocus
        onClick={() => {
          variablesPopoverControls.onClose();
        }}
        onFocus={() => {
          rememberedSelection.current = null;
          if (!isFirstFocus || !editor) return;
          if (editor.children.length === 0) return;
          selectEditor(editor, {
            edge: "end",
          });
          setIsFirstFocus(false);
        }}
        onBlur={() => {
          if (!editor) return;
          rememberedSelection.current = editor.selection;
        }}
        aria-label="Text editor"
      />
      <Popover.Root
        isOpen={variablesPopoverControls.isOpen}
        onClose={variablesPopoverControls.onClose}
      >
        <Popover.Trigger
          className="absolute"
          style={{
            top: variablePopoverAnchorCoords?.top + "px",
            left: variablePopoverAnchorCoords?.left + "px",
          }}
        />
        <Popover.Popup
          className="p-0"
          offset={0}
          // Prevent the editor from closing when clicking on the variable search input
          onPointerDown={(e) => e.stopPropagation()}
        >
          <VariableSearchInput
            initialVariableId={undefined}
            onSelectVariable={handleVariableSelected}
            placeholder={t(
              "editor.blocks.bubbles.textEditor.searchVariable.placeholder",
            )}
            autoFocus
          />
        </Popover.Popup>
      </Popover.Root>
    </Stack>
  );
};
