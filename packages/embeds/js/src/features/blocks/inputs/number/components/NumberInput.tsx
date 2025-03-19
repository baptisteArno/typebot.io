import { SendButton } from "@/components/SendButton";
import { ArrowDownIcon } from "@/components/icons/ArrowDownIcon";
import { ArrowUpIcon } from "@/components/icons/ArrowUpIcon";
import type { CommandData } from "@/features/commands/types";
import type { InputSubmitContent } from "@/types";
import { isMobile } from "@/utils/isMobileSignal";
import { toaster } from "@/utils/toaster";
import { NumberInput as ArkNumberInput, useNumberInput } from "@ark-ui/solid";
import {
  NumberInputStyle,
  defaultNumberInputOptions,
} from "@typebot.io/blocks-inputs/number/constants";
import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import { onCleanup, onMount } from "solid-js";

type NumberInputProps = {
  block: NumberInputBlock;
  defaultValue?: string;
  onSubmit: (value: InputSubmitContent) => void;
};

export const NumberInput = (props: NumberInputProps) => {
  const { style, currency, unit } =
    props.block.options ?? defaultNumberInputOptions;
  const hasMissingCurrency = style === NumberInputStyle.CURRENCY && !currency;
  const formatOptionsStyle = hasMissingCurrency
    ? NumberInputStyle.DECIMAL
    : style;

  const numberInput = useNumberInput({
    formatOptions: {
      style: formatOptionsStyle,
      currency,
      unit,
    },
    min:
      props.block.options?.min !== undefined
        ? Number(props.block.options.min)
        : undefined,
    max:
      props.block.options?.max !== undefined
        ? Number(props.block.options.max)
        : undefined,
    step:
      props.block.options?.step !== undefined
        ? Number(props.block.options.step)
        : undefined,
    translations: {},
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
        value: numberInput().valueAsNumber.toString(),
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
          <ArkNumberInput.IncrementTrigger class="flex items-center justify-center h-7 w-8 border-input-border border-l">
            <ArrowUpIcon />
          </ArkNumberInput.IncrementTrigger>
          <ArkNumberInput.DecrementTrigger class="flex items-center justify-center h-7 w-8 border-input-border border-l">
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
