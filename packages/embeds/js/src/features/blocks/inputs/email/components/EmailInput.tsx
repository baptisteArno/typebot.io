import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import type { EmailInputBlock } from "@typebot.io/blocks-inputs/email/schema";
import { guessDeviceIsMobile } from "@typebot.io/lib/guessDeviceIsMobile";
import { createSignal, onCleanup, onMount } from "solid-js";
import { ShortTextInput } from "../../../../../components/inputs/ShortTextInput";
import { SendButton } from "../../../../../components/SendButton";
import type { InputSubmitContent } from "../../../../../types";
import type { CommandData } from "../../../../commands/types";

type Props = {
  block: EmailInputBlock;
  defaultValue?: string;
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

  const handleSubmit = (event: Event) => {
    event.preventDefault();
    submit();
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
    if (data.command === "submitInput") submit();
  };

  return (
    <form
      class="typebot-input-form flex w-full gap-2 items-end max-w-[350px]"
      onSubmit={handleSubmit}
    >
      <div class={"flex typebot-input w-full"}>
        <ShortTextInput
          ref={inputRef}
          value={inputValue()}
          placeholder={
            props.block.options?.labels?.placeholder ??
            defaultEmailInputOptions.labels.placeholder
          }
          onInput={handleInput}
          type="email"
          autocomplete="email"
        />
      </div>
      <SendButton type="submit" class="h-14">
        {props.block.options?.labels?.button}
      </SendButton>
    </form>
  );
};
