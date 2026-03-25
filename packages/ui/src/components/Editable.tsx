import {
  type ButtonHTMLAttributes,
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { cn } from "../lib/cn";
import { Input, type InputProps } from "./Input";
import { Textarea, type TextareaProps } from "./Textarea";

type EditableContextValue = {
  isEditing: boolean;
  value: string;
  setIsEditing: (editing: boolean) => void;
  setValue: (value: string) => void;
  commitValue: () => void;
};

const EditableContext = createContext<EditableContextValue | null>(null);

const useEditable = () => {
  const context = useContext(EditableContext);
  if (!context)
    throw new Error("Editable compound components must be used within Root");
  return context;
};

type RootProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> & {
  defaultEdit?: boolean;
  value?: string;
  defaultValue?: string;
  children?: ReactNode;
  onValueCommit: (value: string) => void;
  onValueChange?: (value: string) => void;
};

const Root = ({
  defaultEdit,
  value: controlledValue,
  defaultValue,
  onValueCommit,
  onValueChange,
  children,
  ...props
}: RootProps) => {
  const [isEditing, setIsEditing] = useState(defaultEdit ?? false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  const value = controlledValue ?? internalValue;

  const setValue = (updatedValue: string) => {
    if (controlledValue === undefined) setInternalValue(updatedValue);
    onValueChange?.(updatedValue);
  };

  const commitValue = () => {
    setIsEditing(false);
    onValueCommit(value);
  };

  return (
    <EditableContext.Provider
      value={{ isEditing, setIsEditing, value, setValue, commitValue }}
    >
      <div {...props}>{children}</div>
    </EditableContext.Provider>
  );
};

type EditableInputProps = Omit<InputProps, "value">;

const EditableInput = ({ className, ...props }: EditableInputProps) => {
  const { isEditing, value, setValue, commitValue, setIsEditing } =
    useEditable();
  const inputRef = useRef<HTMLInputElement>(null);

  useOutsideClick({
    ref: inputRef,
    capture: true,
    handler: commitValue,
  });

  if (!isEditing) return null;

  return (
    <Input
      {...props}
      ref={inputRef}
      size="none"
      value={value}
      autoFocus
      onFocus={(event) => event.currentTarget.select()}
      onValueChange={(updatedValue, event) => {
        setValue(updatedValue);
        props.onValueChange?.(updatedValue, event);
      }}
      onKeyDownCapture={(event) => {
        props.onKeyDownCapture?.(event);
        if (event.key === "Enter") commitValue();
        if (event.key === "Escape") setIsEditing(false);
      }}
      className={cn("rounded-md border p-1", className)}
    />
  );
};

const additionalFocusHeight = 20;

type EditableTextareaProps = Omit<TextareaProps, "value">;

const EditableTextarea = ({ className, ...props }: EditableTextareaProps) => {
  const { isEditing, value, setValue, commitValue, setIsEditing } =
    useEditable();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = (textareaElement: HTMLTextAreaElement) => {
    textareaElement.style.height = "auto";
    textareaElement.style.height = `${textareaElement.scrollHeight + additionalFocusHeight}px`;
  };

  useEffect(() => {
    const textareaElement = textareaRef.current;
    if (!textareaElement) return;

    const stopMouseWheelPropagation = (event: WheelEvent) => {
      event.stopPropagation();
    };

    textareaElement.addEventListener("wheel", stopMouseWheelPropagation);
    return () => {
      textareaElement.removeEventListener("wheel", stopMouseWheelPropagation);
    };
  }, []);

  useOutsideClick({
    ref: textareaRef,
    capture: true,
    handler: commitValue,
  });

  if (!isEditing) return null;

  return (
    <Textarea
      {...props}
      ref={textareaRef}
      size="none"
      value={value}
      autoFocus
      onFocus={(event) => {
        autoResize(event.currentTarget);
        event.currentTarget.select();
      }}
      onValueChange={(updatedValue) => {
        setValue(updatedValue);
        props.onValueChange?.(updatedValue);
      }}
      onKeyDownCapture={(event) => {
        props.onKeyDownCapture?.(event);
        if (event.key === "Enter" && event.metaKey) commitValue();
        if (event.key === "Escape") setIsEditing(false);
      }}
      className={cn("w-full rounded-md border px-1 py-1", className)}
    />
  );
};

type PreviewProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

const EditablePreview = ({ className, children, ...props }: PreviewProps) => {
  const { isEditing, setIsEditing, value } = useEditable();

  if (isEditing) return null;

  return (
    <button
      {...props}
      type="button"
      onClick={(event) => {
        props.onClick?.(event);
        if (event.defaultPrevented) return;
        setIsEditing(true);
      }}
      className={cn(
        "hover:bg-gray-3 inline-flex w-full cursor-text whitespace-pre-line rounded-md border border-transparent p-1",
        className,
      )}
    >
      {children ?? value}
    </button>
  );
};

export const Editable = {
  Root,
  Input: EditableInput,
  Textarea: EditableTextarea,
  Preview: EditablePreview,
};
