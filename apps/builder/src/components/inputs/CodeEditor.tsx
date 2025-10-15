import { useColorModeValue } from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { Popover } from "@typebot.io/ui/components/Popover";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { cn } from "@typebot.io/ui/lib/cn";
import type { Variable } from "@typebot.io/variables/schemas";
import {
  type LanguageName,
  loadLanguage,
} from "@uiw/codemirror-extensions-langs";
import { githubLight } from "@uiw/codemirror-theme-github";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { CopyButton } from "../CopyButton";
import { BracesIcon } from "../icons";
import { VariablesCombobox } from "./VariablesCombobox";

const VARIABLE_POPOVER_OFFSET_Y = 5;
const VARIABLE_POPOVER_OFFSET_X = 50;

type Props = {
  value?: string;
  defaultValue?: string;
  lang: LanguageName;
  minHeight?: `${number}px`;
  maxHeight?: `${number}px`;
  isReadOnly?: boolean;
  debounceTimeout?: number;
  onChange?: (value: string) => void;
  withLineNumbers?: boolean;
  placeholder?: string;
  withVariableButton?: boolean;
  className?: string;
};
export const CodeEditor = ({
  defaultValue,
  lang,
  minHeight = "150px",
  maxHeight = "250px",
  onChange,
  withLineNumbers = false,
  isReadOnly = false,
  debounceTimeout = 1000,
  placeholder,
  withVariableButton = true,
  className,
  ...props
}: Props) => {
  const theme = useColorModeValue(githubLight, tokyoNight);
  const variablesPopoverControls = useOpenControls();
  const codeEditor = useRef<ReactCodeMirrorRef | null>(null);

  const [carretPosition, setCarretPosition] = useState<number>(0);
  const [variablePopoverAnchorCoords, setVariablePopoverAnchorCoords] =
    useState<{ top: number; left: number } | null>({ top: 0, left: 0 });
  const [value, _setValue] = useState(defaultValue ?? "");

  const setValue = useDebouncedCallback(
    (value) => {
      _setValue(value);
      onChange && onChange(value);
    },
    env.NEXT_PUBLIC_E2E_TEST ? 0 : debounceTimeout,
  );

  const handleVariableSelected = (variable?: Pick<Variable, "id" | "name">) => {
    codeEditor.current?.view?.focus();
    const insert = `{{${variable?.name}}}`;
    codeEditor.current?.view?.dispatch({
      changes: {
        from: carretPosition,
        insert,
      },
      selection: { anchor: carretPosition + insert.length },
    });
    variablesPopoverControls.onClose();
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  const rememberCarretPosition = () => {
    setCarretPosition(
      codeEditor.current?.view?.state?.selection.asSingle().main.head ?? 0,
    );
  };

  const openVariablePopover = () => {
    const view = codeEditor.current?.view;
    if (!view) return;

    if (carretPosition == null) return;

    const caretBox = view.coordsAtPos(carretPosition);
    if (!caretBox) return;

    const editorRect = view.dom.getBoundingClientRect();

    setVariablePopoverAnchorCoords({
      top: caretBox.bottom - editorRect.top + VARIABLE_POPOVER_OFFSET_Y,
      left: caretBox.left - editorRect.left + VARIABLE_POPOVER_OFFSET_X,
    });

    variablesPopoverControls.onOpen();
  };

  useEffect(
    () => () => {
      setValue.flush();
    },
    [setValue],
  );

  const isVariableButtonDisplayed = withVariableButton && !isReadOnly;

  return (
    <div
      style={
        {
          "--editor-min-height": minHeight,
          "--editor-max-height": maxHeight,
        } as CSSProperties
      }
      className={cn(
        "group relative isolate border rounded-md [&_.cm-editor]:font-mono [&_.cm-editor]:text-sm min-h-[var(--editor-min-height)]",
        !withLineNumbers && "[&_.cm-gutters]:hidden",
        "[&_.cm-editor]:rounded-md [&_.cm-editor]:outline-none has-[.cm-focused]:ring-2 transition-[box-shadow,border-color] has-[.cm-focused]:border-transparent ring-orange-7 [&_.cm-scroller]:rounded-md [&_.cm-scroller]:overflow-auto",
        isReadOnly
          ? undefined
          : "[&_.cm-editor]:max-h-[var(--editor-max-height)]",
        className,
      )}
    >
      <CodeMirror
        data-testid="code-editor"
        ref={codeEditor}
        value={props.value ?? value}
        onChange={handleChange}
        onBlur={rememberCarretPosition}
        theme={theme}
        extensions={[loadLanguage(lang)].filter(isDefined)}
        editable={!isReadOnly}
        spellCheck={false}
        basicSetup={{
          highlightActiveLine: false,
        }}
        placeholder={placeholder}
      />
      {isVariableButtonDisplayed && (
        <>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 bottom-1 size-7"
            onClick={openVariablePopover}
          >
            <BracesIcon className="opacity-75" />
          </Button>
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
              className="p-0 data-[open]:duration-0"
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
        </>
      )}
      {isReadOnly && (
        <CopyButton
          data-slot="copy-button"
          textToCopy={props.value ?? value}
          className="absolute right-0.5 top-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        />
      )}
    </div>
  );
};
