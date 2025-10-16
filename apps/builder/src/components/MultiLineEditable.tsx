import { Textarea } from "@typebot.io/ui/components/Textarea";
import { cn } from "@typebot.io/ui/lib/cn";
import { type HTMLAttributes, useEffect, useRef, useState } from "react";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export type MultiLineEditableProps = {
  className?: string;
  input?: Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
  > & {
    onValueChange?: (value: string) => void;
  };
  preview?: HTMLAttributes<HTMLSpanElement>;
  defaultEdit: boolean;
  value: string;
  onValueCommit: (value: string) => void;
};

const ADDITIONAL_FOCUS_HEIGHT = 20 as const;

export const MultiLineEditable = ({
  input,
  preview,
  value,
  defaultEdit,
  onValueCommit,
  ...props
}: MultiLineEditableProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoResize = (textarea: HTMLTextAreaElement) => {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + ADDITIONAL_FOCUS_HEIGHT}px`;
  };

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation();
  };

  useEffect(() => {
    textareaRef.current?.addEventListener("wheel", handleMouseWheel);

    return () => {
      textareaRef.current?.addEventListener("wheel", handleMouseWheel);
    };
  });
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
          onKeyDownCapture={(e) => {
            input?.onKeyDownCapture?.(e);
            if (e.key === "Enter" && e.metaKey) commitValue();
            if (e.key === "Escape") setIsEditing(false);
          }}
          ref={textareaRef}
          size="none"
          value={value}
          className={cn("px-1 py-1 rounded-md border w-full", input?.className)}
          onFocus={(e) => {
            autoResize(e.currentTarget);
            e.currentTarget.select();
          }}
          onValueChange={input?.onValueChange}
          autoFocus
        />
      ) : (
        <span
          {...preview}
          onClick={() => setIsEditing(true)}
          className={cn(
            "hover:bg-gray-3 inline-flex w-full p-1 border border-transparent rounded-md whitespace-pre-line",
            preview?.className,
          )}
        >
          {value}
        </span>
      )}
    </div>
  );
};
