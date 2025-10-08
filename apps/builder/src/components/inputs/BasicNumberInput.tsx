import { env } from "@typebot.io/env";
import { NumberField } from "@typebot.io/ui/components/NumberField";
import { cx } from "@typebot.io/ui/lib/cva";
import type { Variable, VariableString } from "@typebot.io/variables/schemas";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { VariablesCombobox } from "./VariablesCombobox";

type Value<HasVariable> = HasVariable extends true | undefined
  ? number | VariableString
  : number;

type Props<HasVariable extends boolean> = {
  defaultValue: Value<HasVariable> | undefined;
  debounceTimeout?: number;
  withVariableButton?: HasVariable;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  onValueChange: (value?: Value<HasVariable>) => void;
};

export const BasicNumberInput = <HasVariable extends boolean>({
  defaultValue,
  onValueChange,
  withVariableButton,
  debounceTimeout = 1000,
  min,
  max,
  step,
  placeholder,
  disabled,
  className,
}: Props<HasVariable>) => {
  const { typebot } = useTypebot();
  const onValueChangeDebounced = useDebouncedCallback(
    onValueChange,
    env.NEXT_PUBLIC_E2E_TEST ? 0 : debounceTimeout,
  );

  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      onValueChangeDebounced.flush();
    },
    [onValueChangeDebounced],
  );

  const handleValueChange = (value: number | null) => {
    if (value === null) return onValueChangeDebounced(undefined);
    onValueChangeDebounced(value);
  };

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      onValueChange(undefined);
      return;
    }
    const newValue = `{{${variable.name}}}`;
    onValueChange(newValue as Value<HasVariable>);
  };

  if (
    (withVariableButton === undefined || withVariableButton) &&
    typeof defaultValue === "string"
  ) {
    const matchingVariableId = typebot?.variables.find(
      (variable) => variable.name === defaultValue.slice(2, -2),
    )?.id;
    return (
      <VariablesCombobox
        onSelectVariable={handleVariableSelected}
        initialVariableId={matchingVariableId}
      />
    );
  }
  return (
    <NumberField.Root
      onValueChange={handleValueChange}
      defaultValue={defaultValue as number}
      step={step}
      largeStep={step ? step * 10 : undefined}
      smallStep={step ? step / 10 : undefined}
      min={min}
      max={max}
      disabled={disabled}
      className={className}
    >
      <NumberField.Group
        data-focus={isFocused}
        className="data-[focus=true]:outline-none data-[focus=true]:ring-orange-8 data-[focus=true]:ring-2 data-[focus=true]:border-transparent rounded-md transition-[box-shadow,border-color]"
      >
        <NumberField.Decrement />
        <div className="relative flex-1">
          <NumberField.Input
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cx(
              "focus:outline-none focus:ring-0 focus:border-gray-6",
              withVariableButton !== false && "pe-7",
            )}
            placeholder={placeholder}
            ref={inputRef}
          />
          {withVariableButton !== false && (
            <VariablesButton
              onSelectVariable={handleVariableSelected}
              variant="ghost"
              className="[&_svg]:opacity-60 size-7 absolute top-1/2 -translate-y-1/2 right-1"
            />
          )}
        </div>
        <NumberField.Increment />
      </NumberField.Group>
    </NumberField.Root>
  );
};
