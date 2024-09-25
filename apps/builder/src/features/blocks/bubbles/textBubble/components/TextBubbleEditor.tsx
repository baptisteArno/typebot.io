import { platePlugins } from "@/lib/plate";
import type { TElement } from "@udecode/plate-common";
import { Plate } from "@udecode/plate-core";
import React, { useEffect, useRef } from "react";
import { TextEditorEditorContent } from "./TextEditorEditorContent";

type TextBubbleEditorContentProps = {
  id: string;
  initialValue: TElement[];
  onChange: (newContent: TElement[]) => void;
  onClose: () => void;
};

export const TextBubbleEditor = ({
  id,
  initialValue,
  onChange,
  onClose,
}: TextBubbleEditorContentProps) => {
  const textEditorValueRef = useRef<TElement[]>(initialValue);

  const setTextEditorValue = (newValue: TElement[]) => {
    textEditorValueRef.current = newValue;
  };

  useEffect(
    () => () => {
      onChange(textEditorValueRef.current);
    },
    [onChange],
  );

  return (
    <Plate
      id={id}
      plugins={platePlugins}
      initialValue={
        initialValue.length === 0
          ? [{ type: "p", children: [{ text: "" }] }]
          : initialValue
      }
      onChange={setTextEditorValue}
    >
      <TextEditorEditorContent closeEditor={onClose} />
    </Plate>
  );
};
