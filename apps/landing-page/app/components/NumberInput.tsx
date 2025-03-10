import {
  NumberInput as ArkNumberInput,
  type NumberInputRootProps,
} from "@ark-ui/react/number-input";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { ChevronUpIcon } from "@typebot.io/ui/icons/ChevronUpIcon";

type Props = {
  label?: string;
  placeholder?: string;
} & NumberInputRootProps;
export const NumberInput = ({ label, placeholder, ...props }: Props) => (
  <ArkNumberInput.Root {...props}>
    <div className="flex gap-3 items-center">
      {label && (
        <ArkNumberInput.Label className="flex-shrink-0">
          {label}
        </ArkNumberInput.Label>
      )}
      <ArkNumberInput.Control className="border rounded-lg grid-cols-[1fr_32px] grid-rows-[1fr_1fr] focus-within:border-orange-8 focus-within:shadow-orange-8 overflow-hidden divide-x grid ps-3">
        <ArkNumberInput.Input
          className="bg-transparent border-none outline-none w-full disabled:cursor-not-allowed row-span-2"
          placeholder={placeholder}
        />
        <ArkNumberInput.IncrementTrigger className="inline-flex items-center justify-center">
          <ChevronUpIcon className="size-4" />
        </ArkNumberInput.IncrementTrigger>
        <ArkNumberInput.DecrementTrigger className="inline-flex items-center justify-center border-t">
          <ChevronDownIcon className="size-4" />
        </ArkNumberInput.DecrementTrigger>
      </ArkNumberInput.Control>
    </div>
  </ArkNumberInput.Root>
);
