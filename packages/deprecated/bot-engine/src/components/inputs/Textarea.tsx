import { isMobile } from "@/utils/helpers";
import React from "react";

type TextareaProps = {
  onChange: (value: string) => void;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">;

export const Textarea = React.forwardRef(function Textarea(
  { onChange, ...props }: TextareaProps,
  ref: React.ForwardedRef<HTMLTextAreaElement>,
) {
  return (
    <textarea
      ref={ref}
      className="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
      rows={6}
      data-testid="textarea"
      required
      style={{ fontSize: "16px" }}
      autoFocus={!isMobile}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
});
