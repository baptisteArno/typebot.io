import { SendButton } from "@/components/SendButton";
import { ArrowDownIcon } from "@/components/icons/ArrowDownIcon";
import { ArrowUpIcon } from "@/components/icons/ArrowUpIcon";
import type { CommandData } from "@/features/commands/types";
import type { InputSubmitContent } from "@/types";
import { isMobile } from "@/utils/isMobileSignal";
import { NumberInput as ArkNumberInput, useNumberInput } from "@ark-ui/solid";
import { defaultNumberInputOptions } from "@typebot.io/blocks-inputs/number/constants";
import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import { onCleanup, onMount } from "solid-js";

const DEFAULT_PRECISION = 2;

type NumberInputProps = {
  block: NumberInputBlock;
  defaultValue?: string;
  onSubmit: (value: InputSubmitContent) => void;
};

export const NumberInput = (props: NumberInputProps) => {
  const minValue =
    props.block.options?.min !== undefined
      ? Number(props.block.options.min)
      : undefined;
  const maxValue =
    props.block.options?.max !== undefined
      ? Number(props.block.options.max)
      : undefined;
  const stepValue =
    props.block.options?.step !== undefined
      ? Number(props.block.options.step)
      : undefined;

  const numberInput = useNumberInput({
    formatOptions: {
      style: props.block.options?.style,
      currency: props.block.options?.currency,
      unit: props.block.options?.unit,
    },
    min: minValue,
    max: maxValue,
    step: stepValue,
  });
  let inputRef: HTMLInputElement | undefined;

  const isInputValid = () => {
    if (numberInput().invalid) {
      inputRef?.reportValidity();
      return false;
    }
    return true;
  };

  const submit = () => {
    if (isInputValid()) {
      props.onSubmit({
        type: "text",
        value: numberInput().valueAsNumber.toFixed(DEFAULT_PRECISION),
      });
    } else numberInput().focus();
  };

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true });
    window.addEventListener("message", processIncomingEvent);
  });

  onCleanup(() => {
    window.removeEventListener("message", processIncomingEvent);
  });

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event;
    if (!data.isFromTypebot) return;
    if (data.command === "setInputValue")
      numberInput().setValue(Number(data.value));
  };

  return (
    <div
      class="typebot-input-form flex w-full gap-2 items-end max-w-[350px]"
      onKeyDown={submitWhenEnter}
    >
      <ArkNumberInput.RootProvider
        value={numberInput}
        class="flex typebot-input w-full"
      >
        <ArkNumberInput.Input
          ref={inputRef}
          class="focus:outline-none bg-transparent px-4 py-4 flex-1 w-full text-input"
          style={{ "font-size": "16px", appearance: "auto" }}
          placeholder={
            props.block.options?.labels?.placeholder ??
            defaultNumberInputOptions.labels.placeholder
          }
        />
        <ArkNumberInput.Control class="flex flex-col rounded-r-md overflow-hidden divide-y h-[56px]">
          <ArkNumberInput.IncrementTrigger class="flex items-center justify-center h-7 w-8 typebot-input-controls">
            <ArrowUpIcon />
          </ArkNumberInput.IncrementTrigger>
          <ArkNumberInput.DecrementTrigger class="flex items-center justify-center h-7 w-8 typebot-input-controls">
            <ArrowDownIcon />
          </ArkNumberInput.DecrementTrigger>
        </ArkNumberInput.Control>
      </ArkNumberInput.RootProvider>
      <SendButton type="button" class="h-[56px]" on:click={submit}>
        {props.block.options?.labels?.button}
      </SendButton>
    </div>
  );
};
