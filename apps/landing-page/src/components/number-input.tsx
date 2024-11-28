import { cn } from "@/lib/utils";
import { NumberInput as ArkNumberInput } from "@ark-ui/react";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { ChevronUpIcon } from "@typebot.io/ui/icons/ChevronUpIcon";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";

const numberInputRoot = cva("flex flex-col gap-6");

const numberInputControl = cva(
  "border transition-all duration-200 grid-cols-[1fr_32px] divide-x focus-within:ring-1 focus-within:ring-orange-8 disabled:opacity-40 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        md: "h-10 min-w-[2.5rem] text-md ps-3",
        lg: "h-11 min-w-[2.75rem] text-md ps-3.5",
        xl: "h-12 min-w-[3rem] text-lg ps-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const numberInputInput = cva(
  "w-full row-span-2 bg-transparent border-none outline-none disabled:cursor-not-allowed",
);

const numberInputLabel = cva("font-medium text-foreground", {
  variants: {
    size: {
      md: "text-sm",
      lg: "text-sm",
      xl: "text-md",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const triggerStyles =
  "inline-flex items-center justify-center cursor-pointer transition-colors duration-200 disabled:cursor-not-allowed [&>svg]:w-4 [&>svg]:h-4";

const numberInputTrigger = {
  decrement: cva([triggerStyles, "border-t"]),
  increment: cva([triggerStyles]),
};

export const numberInputVariants = {
  root: numberInputRoot,
  control: numberInputControl,
  input: numberInputInput,
  label: numberInputLabel,
  decrementTrigger: numberInputTrigger.decrement,
  incrementTrigger: numberInputTrigger.increment,
};

type Props = ArkNumberInput.RootProps;

export const NumberInput = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, ...rootProps } = props;
  return (
    <ArkNumberInput.Root
      ref={ref}
      {...rootProps}
      className={cn(
        numberInputVariants.root({ className: rootProps.className }),
      )}
    >
      {children && (
        <ArkNumberInput.Label className={numberInputVariants.label()}>
          {children}
        </ArkNumberInput.Label>
      )}
      <ArkNumberInput.Control className={numberInputVariants.control()}>
        <ArkNumberInput.Input className={numberInputVariants.input()} />
        <ArkNumberInput.IncrementTrigger
          className={numberInputVariants.incrementTrigger()}
        >
          <ChevronUpIcon />
        </ArkNumberInput.IncrementTrigger>
        <ArkNumberInput.DecrementTrigger
          className={numberInputVariants.decrementTrigger()}
        >
          <ChevronDownIcon />
        </ArkNumberInput.DecrementTrigger>
      </ArkNumberInput.Control>
    </ArkNumberInput.Root>
  );
});

NumberInput.displayName = "NumberInput";
