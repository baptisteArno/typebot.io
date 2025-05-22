import { SendButton } from "@/components/SendButton";
import { ChevronDownIcon } from "@/components/icons/ChevronDownIcon";
import { ChevronUpIcon } from "@/components/icons/ChevronUpIcon";
import type { CommandData } from "@/features/commands/types";
import type { InputSubmitContent } from "@/types";
import { NumberInput as ArkNumberInput, useNumberInput } from "@ark-ui/solid";
import {
  NumberInputStyle,
  defaultNumberInputButtonLabel,
  defaultNumberInputPlaceholder,
  defaultNumberInputStyle,
} from "@typebot.io/blocks-inputs/number/constants";
import type { NumberInputBlock } from "@typebot.io/blocks-inputs/number/schema";
import { guessDeviceIsMobile } from "@typebot.io/lib/guessDeviceIsMobile";
import { safeParseFloat } from "@typebot.io/lib/safeParseFloat";
import { onCleanup, onMount } from "solid-js";

type NumberInputProps = {
  block: NumberInputBlock;
  defaultValue?: string;
  onSubmit: (value: InputSubmitContent) => void;
};

export const NumberInput = (props: NumberInputProps) => {
  const numberInput = useNumberInput({
    locale: props.block.options?.locale,
    formatOptions: parseFormatOptions(props.block.options),
    min: safeParseFloat(props.block.options?.min),
    max: safeParseFloat(props.block.options?.max),
    step: safeParseFloat(props.block.options?.step),
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
        label: numberInput().value.toString(),
      });
    } else numberInput().focus();
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
            defaultNumberInputPlaceholder
          }
        />
        <ArkNumberInput.Control class="flex flex-col rounded-r-md overflow-hidden divide-y h-[56px]">
          <ArkNumberInput.IncrementTrigger class="flex items-center justify-center h-7 w-8 border-input-border border-l">
            <ChevronUpIcon class="size-4" />
          </ArkNumberInput.IncrementTrigger>
          <ArkNumberInput.DecrementTrigger class="flex items-center justify-center h-7 w-8 border-input-border border-l">
            <ChevronDownIcon class="size-4" />
          </ArkNumberInput.DecrementTrigger>
        </ArkNumberInput.Control>
      </ArkNumberInput.RootProvider>
      <SendButton type="button" class="h-[56px]" on:click={submit}>
        {props.block.options?.labels?.button ?? defaultNumberInputButtonLabel}
      </SendButton>
    </div>
  );
};

const parseFormatOptions = (
  options: NumberInputBlock["options"],
): Intl.NumberFormatOptions => {
  const defaultFormat = {
    style: defaultNumberInputStyle,
  };
  if (options?.style === NumberInputStyle.CURRENCY && options.currency)
    return {
      style: options.style,
      currency: options.currency,
    };
  if (options?.style === NumberInputStyle.UNIT && options.unit)
    return {
      style: options.style,
      unit: options.unit,
    };
  return defaultFormat;
};
