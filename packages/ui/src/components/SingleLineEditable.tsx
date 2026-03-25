import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { cn } from "../lib/cn";
import type { InputProps } from "./Input";
import { Input } from "./Input";

export type SingleLineEditableProps = {
  className?: string;
  input?: Omit<InputProps, "value">;
  preview?: ButtonHTMLAttributes<HTMLButtonElement>;
  common?: HTMLAttributes<HTMLButtonElement | HTMLInputElement>;
  defaultEdit?: boolean;
  value?: string;
  defaultValue?: string;
  onValueCommit: (value: string) => void;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  children?: ReactNode;
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
          ref={inputRef}
          onKeyDownCapture={(event) => {
            input?.onKeyDownCapture?.(event);
            if (event.key === "Enter") commitValue();
            if (event.key === "Escape") setIsEditing(false);
          }}
          size="none"
          value={value ?? currentValue}
          autoFocus
          onFocus={(event) => event.currentTarget.select()}
          onValueChange={(updatedValue, event) => {
            setCurrentValue(updatedValue);
            input?.onValueChange?.(updatedValue, event);
          }}
          className={cn(
            "rounded-md border p-1",
            common?.className,
            input?.className,
          )}
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
            "hover:bg-gray-3 inline-flex w-full cursor-text rounded-md border border-transparent p-1",
            common?.className,
            preview?.className,
          )}
        >
          {value ?? currentValue}
        </button>
      )}
      {children}
    </div>
  );
};
