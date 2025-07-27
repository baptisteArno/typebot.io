import { VariableSearchInput } from "@/components/inputs/VariableSearchInput";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { editorStyle, platePlugins } from "@/lib/plate";
import {
  Flex,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Portal,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { colors } from "@typebot.io/ui/chakraTheme";
import type { Variable } from "@typebot.io/variables/schemas";
import type { TElement } from "@udecode/plate-common";
import { focusEditor, insertText, selectEditor } from "@udecode/plate-common";
import { Plate, PlateContent, useEditorRef } from "@udecode/plate-core";
import { useCallback, useEffect, useRef, useState } from "react";
import { TextEditorToolBar } from "../../blocks/bubbles/textBubble/components/TextEditorToolBar";

// Component to capture the editor ref from Plate context
const EditorRefCapture = ({
  onEditorRef,
}: {
  onEditorRef: (editor: any) => void;
}) => {
  const editor = useEditorRef();

  useEffect(() => {
    onEditorRef(editor);
  }, [editor, onEditorRef]);

  return null;
};

type TranslationRichTextEditorProps = {
  id: string;
  initialValue: TElement[];
  onChange: (newContent: TElement[]) => void;
  placeholder?: string;
  height?: string;
};

export const TranslationRichTextEditor = ({
  id,
  initialValue,
  onChange,
  placeholder,
  height = "120px",
}: TranslationRichTextEditorProps) => {
  const { t } = useTranslate();
  const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false);
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const editorRef = useRef<any>(null);

  const varDropdownRef = useRef<HTMLDivElement | null>(null);
  const rememberedSelection = useRef<any>(null);
  const textEditorRef = useRef<HTMLDivElement>(null);
  const plateContentRef = useRef<HTMLDivElement>(null);

  const handleVariableSelected = (variable?: Variable) => {
    setIsVariableDropdownOpen(false);
    if (!variable || !editorRef.current) return;
    focusEditor(editorRef.current);
    insertText(editorRef.current, "{{" + variable.name + "}}");
  };

  const computeTargetCoord = useCallback(() => {
    if (rememberedSelection.current) return { top: 0, left: 0 };
    const selection = window.getSelection();
    const relativeParent = textEditorRef.current;
    if (!selection || !relativeParent) return { top: 0, left: 0 };
    const range = selection.getRangeAt(0);
    const selectionBoundingRect = range.getBoundingClientRect();
    const relativeRect = relativeParent.getBoundingClientRect();
    return {
      top: selectionBoundingRect.bottom - relativeRect.top,
      left: selectionBoundingRect.left - relativeRect.left,
    };
  }, []);

  useEffect(() => {
    if (!isVariableDropdownOpen) return;
    const el = varDropdownRef.current;
    if (!el) return;
    const { top, left } = computeTargetCoord();
    if (top === 0 && left === 0) return;
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  }, [computeTargetCoord, isVariableDropdownOpen]);

  return (
    <Stack
      ref={textEditorRef}
      borderWidth="1px"
      borderColor={useColorModeValue("gray.300", "gray.600")}
      rounded="md"
      pos="relative"
      spacing={0}
      cursor="text"
      height={height}
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
      <Plate
        id={id}
        plugins={platePlugins}
        initialValue={
          initialValue.length === 0
            ? [{ type: "p", children: [{ text: "" }] }]
            : initialValue
        }
        onChange={onChange}
      >
        <EditorRefCapture
          onEditorRef={(editor) => {
            editorRef.current = editor;
          }}
        />
        <TextEditorToolBar
          onVariablesButtonClick={() => setIsVariableDropdownOpen(true)}
        />
        <PlateContent
          ref={plateContentRef}
          style={{
            ...editorStyle(useColorModeValue("white", colors.gray[900])),
            minHeight: "80px",
            flex: 1,
          }}
          placeholder={placeholder}
          onClick={() => {
            setIsVariableDropdownOpen(false);
          }}
          onFocus={() => {
            rememberedSelection.current = null;
            if (!isFirstFocus || !editorRef.current) return;
            if (editorRef.current.children.length === 0) return;
            selectEditor(editorRef.current, {
              edge: "end",
            });
            setIsFirstFocus(false);
          }}
          onBlur={() => {
            if (!editorRef.current) return;
            rememberedSelection.current = editorRef.current.selection;
          }}
          aria-label="Rich text editor for translation"
        />
      </Plate>
      <Popover isOpen={isVariableDropdownOpen} isLazy>
        <PopoverAnchor>
          <Flex pos="absolute" ref={varDropdownRef} />
        </PopoverAnchor>
        <Portal>
          <PopoverContent>
            <VariableSearchInput
              initialVariableId={undefined}
              onSelectVariable={handleVariableSelected}
              placeholder={t(
                "editor.blocks.bubbles.textEditor.searchVariable.placeholder",
              )}
              autoFocus
            />
          </PopoverContent>
        </Portal>
      </Popover>
    </Stack>
  );
};
