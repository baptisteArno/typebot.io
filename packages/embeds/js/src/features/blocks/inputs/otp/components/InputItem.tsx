import type { InputSubmitContent } from "@/types";
import type { BotContext } from "@/types";
import type { OtpInputBlock } from "@typebot.io/blocks-inputs/otp/schema";
import { createSignal, onCleanup, onMount } from "solid-js";

type Props = {
  handleFocus: (e: FocusEvent) => void;
  handlePaste: (e: ClipboardEvent) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  handleInput: (e: any) => void;
};

export const InputItem = (props: Props) => {
  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    if (inputRef) {
      inputRef.addEventListener("input", props.handleInput);
      inputRef.addEventListener("keydown", props.handleKeyDown);
      inputRef.addEventListener("focus", props.handleFocus);
      inputRef.addEventListener("paste", props.handlePaste);
    }
  });

  onCleanup(() => {
    if (inputRef) {
      inputRef.removeEventListener("input", props.handleInput);
      inputRef.removeEventListener("keydown", props.handleKeyDown);
      inputRef.removeEventListener("focus", props.handleFocus);
      inputRef.removeEventListener("paste", props.handlePaste);
    }
  });

  return (
    <input
      type="text"
      ref={inputRef}
      class="text-input w-10 h-10 text-center text-lg font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-2 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
      pattern="\d*"
      maxlength="1"
    />
  );
};
