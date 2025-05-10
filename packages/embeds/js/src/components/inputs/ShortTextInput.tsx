import { splitProps } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";

type ShortTextInputProps = {
  ref: HTMLInputElement | undefined;
  onInput: (value: string) => void;
  inputMode?:
    | "text"
    | "email"
    | "search"
    | "tel"
    | "url"
    | "numeric"
    | "decimal";
} & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onInput">;

export const ShortTextInput = (props: ShortTextInputProps) => {
  const [local, others] = splitProps(props, ["ref", "onInput", "inputMode"]);

  return (
    <input
      ref={props.ref}
      class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
      type="text"
      onInput={(e) => local.onInput(e.currentTarget.value)}
      inputMode={local.inputMode}
      {...others}
    />
  );
};
