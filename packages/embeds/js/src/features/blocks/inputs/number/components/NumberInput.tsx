import { SendButton } from "@/components/SendButton";
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
  const numberInput = useNumberInput({
    formatOptions: {
      style: props.block.options?.style,
      currency: props.block.options?.currency,
      unit: props.block.options?.unit,
    },
  });
  let inputRef: HTMLInputElement | undefined;

  const submit = () => {
    if (!numberInput().invalid) {
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
          min={minValue}
          max={maxValue}
          step={stepValue}
        />
        <ArkNumberInput.Control class="flex flex-col items-center justify-center">
          <ArkNumberInput.IncrementTrigger class="flex items-center justify-center w-8 h-4">
            +
          </ArkNumberInput.IncrementTrigger>
          <ArkNumberInput.DecrementTrigger class="flex items-center justify-center w-8 h-4">
            -
          </ArkNumberInput.DecrementTrigger>
        </ArkNumberInput.Control>
      </ArkNumberInput.RootProvider>
      <SendButton type="button" class="h-[56px]" on:click={submit}>
        {props.block.options?.labels?.button}
      </SendButton>
    </div>
  );
};
