import {
  type ButtonHTMLAttributes,
  type TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { cn } from "../lib/cn";
import { Textarea } from "./Textarea";

export type MultiLineEditableProps = {
  className?: string;
  input?: Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
  > & {
    onValueChange?: (value: string) => void;
  };
  preview?: ButtonHTMLAttributes<HTMLButtonElement>;
  defaultEdit: boolean;
  value: string;
  onValueCommit: (value: string) => void;
};

const additionalFocusHeight = 20;

export const MultiLineEditable = ({
  input,
  preview,
  value,
  defaultEdit,
  onValueCommit,
  ...props
}: MultiLineEditableProps) => {
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

  const [isEditing, setIsEditing] = useState(defaultEdit);

  const commitValue = () => {
    setIsEditing(false);
    onValueCommit(value);
  };

  useOutsideClick({
    ref: textareaRef,
    capture: true,
    handler: commitValue,
  });

  return (
    <div {...props}>
      {isEditing ? (
        <Textarea
          {...input}
          onKeyDownCapture={(event) => {
            input?.onKeyDownCapture?.(event);
            if (event.key === "Enter" && event.metaKey) commitValue();
            if (event.key === "Escape") setIsEditing(false);
          }}
          ref={textareaRef}
          size="none"
          value={value}
          className={cn("w-full rounded-md border px-1 py-1", input?.className)}
          onFocus={(event) => {
            autoResize(event.currentTarget);
            event.currentTarget.select();
          }}
          onValueChange={input?.onValueChange}
          autoFocus
        />
      ) : (
        <button
          {...preview}
          type="button"
          onClick={(event) => {
            preview?.onClick?.(event);
            if (event.defaultPrevented) return;
            setIsEditing(true);
          }}
          className={cn(
            "hover:bg-gray-3 inline-flex w-full cursor-pointer whitespace-pre-line rounded-md border border-transparent p-1",
            preview?.className,
          )}
        >
          {value}
        </button>
      )}
    </div>
  );
};
