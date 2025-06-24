import { ShortTextInput } from "@/components/inputs/ShortTextInput";
import type { CommandData } from "@/features/commands/types";
import type { BotContext, InputSubmitContent } from "@/types";
import type { EmailInputBlock } from "@typebot.io/blocks-inputs/email/schema";
import { guessDeviceIsMobile } from "@typebot.io/lib/guessDeviceIsMobile";
import { createSignal, onCleanup, onMount } from "solid-js";

type Props = {
  block: EmailInputBlock;
  defaultValue?: string;
  name: string;
  context: BotContext;
  error?: boolean;
  onSubmit: (value: InputSubmitContent) => void;
};

export const EmailInput = (props: Props) => {
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? "");
  let inputRef: HTMLInputElement | undefined;

  const handleInput = (inputValue: string) => setInputValue(inputValue);

  const checkIfInputIsValid = () =>
    inputRef?.value !== "" && inputRef?.reportValidity();

  const submit = () => {
    if (checkIfInputIsValid())
      props.onSubmit({ type: "text", value: inputRef?.value ?? inputValue() });
    else inputRef?.focus();
  };

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  onMount(() => {
    if (!guessDeviceIsMobile() && inputRef)
      inputRef.focus({ preventScroll: true });
    window.addEventListener("message", processIncomingEvent);
  });

  onCleanup(() => {
    window.removeEventListener("message", processIncomingEvent);
  });

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event;
    if (!data.isFromTypebot) return;
    if (data.command === "setInputValue") setInputValue(data.value);
  };

  return (
    <div
      class="typebot-input-form flex w-full gap-2 items-end max-w-[350px]"
      onKeyDown={submitWhenEnter}
    >
      <div
        class={"flex typebot-input w-full"}
        style={{
          "border-color": props.error ? " #FF4949" : "",
        }}
      >
        <ShortTextInput
          ref={inputRef}
          name={props.name}
          value={inputValue()}
          onInput={handleInput}
          type="email"
          autocomplete="email"
        />
      </div>
    </div>
  );
};
