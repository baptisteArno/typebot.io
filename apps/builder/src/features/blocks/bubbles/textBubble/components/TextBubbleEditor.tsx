import type { TElement, Value } from "@typebot.io/rich-text/plate";
import {
  Plate,
  PlateContent,
  type PlateEditor,
  usePlateEditor,
} from "@typebot.io/rich-text/plate/react";
import { plateCorePlugins } from "@typebot.io/rich-text/plateCorePlugins";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { Separator } from "@typebot.io/ui/components/Separator";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { CodeIcon } from "@typebot.io/ui/icons/CodeIcon";
import type { Variable } from "@typebot.io/variables/schemas";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { VariablesCombobox } from "@/components/inputs/VariablesCombobox";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { plateUIPlugins } from "../plateUIPlugins";

type TextBubbleEditorContentProps = {
  id: string;
  initialValue: TElement[];
  onChange: (newContent: TElement[]) => void;
  onClose: () => void;
};

const VARIABLE_POPOVER_OFFSET_Y = 5;
const VARIABLE_POPOVER_OFFSET_X = 50;

export const TextBubbleEditor = ({
  id,
  initialValue,
  onChange,
  onClose,
}: TextBubbleEditorContentProps) => {
  const { graphPosition } = useGraph();
  const editor = usePlateEditor({
    id,
    plugins: [...plateCorePlugins, ...plateUIPlugins],
    value:
      initialValue.length === 0
        ? [{ type: "p", children: [{ text: "" }] }]
        : initialValue,
  });

  const variablesPopoverControls = useOpenControls();
  const [isFirstFocus, setIsFirstFocus] = useState(true);
  const [variablePopoverAnchorCoords, setVariablePopoverAnchorCoords] =
    useState<{ top: number; left: number } | null>({ top: 0, left: 0 });

  const rememberedSelection = useRef<typeof editor.selection | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return;
    variablesPopoverControls.onClose();
    editor.tf.focus();
    editor.tf.insertText("{{" + variable.name + "}}");
  };

  useOutsideClick({
    ref: containerRef,
    handler: onClose,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.shiftKey) return;
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onClose();
  };

  const openVariablePopover = () => {
    if (rememberedSelection.current) return { top: 0, left: 0 };
    const selection = window.getSelection();
    const relativeParent = containerRef.current;
    if (!selection || !relativeParent) return { top: 0, left: 0 };
    const range = selection.getRangeAt(0);
    const selectionBoundingRect = range.getBoundingClientRect();
    const relativeRect = relativeParent.getBoundingClientRect();
    const scale = graphPosition.scale ?? 1;
    setVariablePopoverAnchorCoords({
      top:
        (selectionBoundingRect.bottom -
          relativeRect.top +
          VARIABLE_POPOVER_OFFSET_Y) /
        scale,
      left:
        (selectionBoundingRect.left -
          relativeRect.left +
          VARIABLE_POPOVER_OFFSET_X) /
        scale,
    });
    variablesPopoverControls.onOpen();
  };
  const textEditorValueRef = useRef<TElement[]>(initialValue);

  const setTextEditorValue = (options: {
    editor: PlateEditor;
    value: Value;
  }) => {
    textEditorValueRef.current = options.value;
  };

  useEffect(
    () => () => {
      onChange(textEditorValueRef.current);
    },
    [onChange],
  );

  return (
    <Plate editor={editor} onChange={setTextEditorValue}>
      <div ref={containerRef} className="relative">
        <div className="flex items-center justify-end py-1 pr-1 rounded-t-md border-orange-8 border-2 border-b-0 border-b-gray-6">
          <Button
            // Needs to be called before editor blur
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openVariablePopover();
            }}
            data-base-ui-click-trigger
            size="icon"
            variant="secondary"
            className="size-8"
          >
            <CodeIcon />
          </Button>
        </div>
        <Separator className="-mb-0.5" />
        <PlateContent
          onKeyDown={handleKeyDown}
          autoFocus
          onClick={() => {
            variablesPopoverControls.onClose();
          }}
          onFocus={() => {
            rememberedSelection.current = null;
            if (!isFirstFocus || !editor) return;
            if (editor.children.length === 0) return;
            editor.tf.select([], {
              edge: "end",
            });
            setIsFirstFocus(false);
          }}
          onBlur={() => {
            if (!editor) return;
            rememberedSelection.current = editor.selection;
          }}
          aria-abel="Text editor"
          className="prevent-group-drag cursor-text p-3 outline-none rounded-b-md border-t-0 border-orange-8 border-2"
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
            className="p-0 data-open:duration-0"
            offset={0}
            // Prevent the editor from closing when clicking on the variable search input
            onPointerDown={(e) => e.stopPropagation()}
          >
            <VariablesCombobox
              initialVariableId={undefined}
              onSelectVariable={handleVariableSelected}
              defaultOpen
              className="w-72"
            />
          </Popover.Popup>
        </Popover.Root>
      </div>
    </Plate>
  );
};
