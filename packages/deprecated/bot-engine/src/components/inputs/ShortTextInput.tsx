import { isMobile } from "@/utils/helpers";
import React from "react";

type ShortTextInputProps = {
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

export const ShortTextInput = React.forwardRef(function ShortTextInput(
  { onChange, ...props }: ShortTextInputProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      ref={ref}
      className="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
      type="text"
      style={{ fontSize: "16px" }}
      autoFocus={!isMobile}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
});
