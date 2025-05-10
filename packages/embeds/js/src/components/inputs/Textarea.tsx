import { isMobile } from "@/utils/isMobileSignal";
import { type JSX, splitProps } from "solid-js";

type TextareaProps = {
  ref: HTMLTextAreaElement | undefined;
  onInput: (value: string) => void;
  inputMode?:
    | "text"
    | "email"
    | "search"
    | "tel"
    | "url"
    | "numeric"
    | "decimal";
} & Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "onInput">;

export const Textarea = (props: TextareaProps) => {
  const [local, others] = splitProps(props, ["ref", "onInput", "inputMode"]);

  return (
    <textarea
      ref={local.ref}
      class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
      rows={6}
      data-testid="textarea"
      required
      autofocus={!isMobile()}
      onInput={(e) => local.onInput(e.currentTarget.value)}
      inputMode={local.inputMode}
      {...others}
    />
  );
};
