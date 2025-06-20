import { guessDeviceIsMobile } from "@typebot.io/lib/guessDeviceIsMobile";
import { type JSX, splitProps } from "solid-js";

type TextareaProps = {
  ref: HTMLTextAreaElement | undefined;
  onInput: (value: string) => void;
  inputmode?: string;
} & Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "onInput">;

export const Textarea = (props: TextareaProps) => {
  const [local, others] = splitProps(props, ["ref", "onInput", "inputmode"]);

  const isMobile = guessDeviceIsMobile();

  return (
    <textarea
      ref={local.ref}
      class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
      rows={6}
      data-testid="textarea"
      required
      autofocus={!isMobile}
      inputmode={local.inputmode}
      onInput={(e) => local.onInput(e.currentTarget.value)}
      {...others}
    />
  );
};
