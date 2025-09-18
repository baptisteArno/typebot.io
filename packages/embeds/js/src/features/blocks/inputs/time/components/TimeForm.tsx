import type { TimeInputBlock } from "@typebot.io/blocks-inputs/time/schema";
import { guessDeviceIsMobile } from "@typebot.io/lib/guessDeviceIsMobile";
import { createSignal, onCleanup, onMount } from "solid-js";
import { SendButton } from "@/components/SendButton";
import type { CommandData } from "@/features/commands/types";
import type { InputSubmitContent } from "@/types";

type Props = {
  block: TimeInputBlock["options"];
  defaultValue?: string;
  onSubmit: (value: InputSubmitContent) => void;
};

export const TimeForm = (props: Props) => {
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
    if (data.command === "submitInput") submit();
  };

  return (
    <div
      class="typebot-input-form flex w-full gap-2 items-end max-w-[350px]"
      onKeyDown={submitWhenEnter}
    >
      <div class={"flex typebot-input w-full"}>
        <input
          class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input typebot-datetime-input "
          style={{
            "font-size": "16px",
          }}
          ref={inputRef}
          value={inputValue()}
          type="time"
          onInput={(e) => {
            handleInput(e.currentTarget.value);
          }}
          data-testid="time"
        />
      </div>
      <SendButton type="button" class="h-[56px]" on:click={submit}>
        {props.block?.labels?.button}
      </SendButton>
    </div>
  );
};
