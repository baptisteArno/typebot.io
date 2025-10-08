import { Input, type InputProps } from "@typebot.io/ui/components/Input";
import { cn } from "@typebot.io/ui/lib/cn";
import { type HTMLAttributes, useRef, useState } from "react";
import { useOutsideClick } from "@/hooks/useOutsideClick";

export type SingleLineEditableProps = {
  className?: string;
  input?: Omit<InputProps, "value">;
  preview?: HTMLAttributes<HTMLSpanElement>;
  common?: HTMLAttributes<HTMLSpanElement | HTMLInputElement>;
  defaultEdit?: boolean;
  value?: string;
  defaultValue?: string;
  onValueCommit: (value: string) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
};

export const SingleLineEditable = ({
  input,
  preview,
  common,
  value,
  defaultValue,
  defaultEdit,
  onValueCommit,
  children,
  ...props
}: SingleLineEditableProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(defaultEdit ?? false);
  const [currentValue, setCurrentValue] = useState(defaultValue ?? "");

  const commitValue = () => {
    setIsEditing(false);
    onValueCommit(value ?? currentValue);
  };

  useOutsideClick({
    ref: inputRef,
    capture: true,
    handler: commitValue,
  });

  return (
    <div {...props}>
      {isEditing ? (
        <Input
          {...input}
          onKeyDownCapture={(e) => {
            input?.onKeyDownCapture?.(e);
            if (e.key === "Enter") commitValue();
            if (e.key === "Escape") setIsEditing(false);
          }}
          size="none"
          ref={inputRef}
          value={value ?? currentValue}
          autoFocus
          onFocus={(e) => e.currentTarget.select()}
          onValueChange={(value, e) => {
            setCurrentValue(value);
            input?.onValueChange?.(value, e);
          }}
          className={cn(
            "p-1 rounded-md border",
            common?.className,
            input?.className,
          )}
        />
      ) : (
        <span
          {...preview}
          onClick={(e) => {
            preview?.onClick?.(e);
            setIsEditing(true);
          }}
          className={cn(
            "hover:bg-gray-3 inline-flex w-full p-1 border border-transparent rounded-md cursor-pointer",
            common?.className,
            preview?.className,
          )}
        >
          {value ?? currentValue}
        </span>
      )}
      {children}
    </div>
  );
};
