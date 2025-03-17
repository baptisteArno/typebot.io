import { VariablesButton } from "@/features/variables/components/VariablesButton";
import {
  NumberInput as ArkNumberInput,
  type NumberInputRootProps,
} from "@ark-ui/react/number-input";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { ChevronDownIcon } from "@typebot.io/ui/icons/ChevronDownIcon";
import { ChevronUpIcon } from "@typebot.io/ui/icons/ChevronUpIcon";
import type { Variable, VariableString } from "@typebot.io/variables/schemas";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { MoreInfoTooltip } from "../MoreInfoTooltip";

type Value<HasVariable> = HasVariable extends true | undefined
  ? number | VariableString
  : number;

type Props<HasVariable extends boolean> = {
  defaultValue: Value<HasVariable> | undefined;
  debounceTimeout?: number;
  withVariableButton?: HasVariable;
  label?: string;
  moreInfoTooltip?: string;
  isRequired?: boolean;
  direction?: "row" | "column";
  suffix?: string;
  helperText?: ReactNode;
  placeholder?: string;
  onValueChange: (value?: Value<HasVariable>) => void;
  width?: string | number;
} & Omit<
  NumberInputRootProps,
  | "defaultValue"
  | "value"
  | "onChange"
  | "onValueChange"
  | "isRequired"
  | "width"
>;

export const NumberInput = <HasVariable extends boolean>({
  defaultValue,
  onValueChange,
  withVariableButton,
  debounceTimeout = 1000,
  label,
  moreInfoTooltip,
  isRequired,
  direction = "column",
  suffix,
  helperText,
  placeholder,
  width,
  ...props
}: Props<HasVariable>) => {
  const defaultValueStr = defaultValue?.toString() ?? "";
  const isDefaultValueVariable =
    typeof defaultValue === "string" &&
    defaultValue.startsWith("{{") &&
    defaultValue.endsWith("}}");

  const [isTouched, setIsTouched] = useState(false);
  const [value, setValue] = useState(defaultValueStr);
  const inputRef = useRef<HTMLInputElement>(null);
  const isVariableRef = useRef(isDefaultValueVariable);

  const onValueChangeDebounced = useDebouncedCallback(
    onValueChange,
    env.NEXT_PUBLIC_E2E_TEST ? 0 : debounceTimeout,
  );

  useEffect(() => {
    if (isTouched || value !== "" || !defaultValue) return;

    const newDefaultValueStr = defaultValue.toString();
    setValue(newDefaultValueStr);

    const isVariable =
      typeof defaultValue === "string" &&
      defaultValue.startsWith("{{") &&
      defaultValue.endsWith("}}");

    isVariableRef.current = isVariable;
  }, [defaultValue, isTouched, value]);

  useEffect(
    () => () => {
      onValueChangeDebounced.flush();
    },
    [onValueChangeDebounced],
  );

  const handleValueChange = (newValue: string) => {
    if (!isTouched) setIsTouched(true);

    if (isVariableRef.current && newValue === "") return;

    setValue(newValue);

    if (newValue.endsWith(".") || newValue.endsWith(",")) return;
    if (newValue === "") {
      onValueChangeDebounced(undefined);
      return;
    }

    if (
      newValue.startsWith("{{") &&
      newValue.endsWith("}}") &&
      newValue.length > 4 &&
      (withVariableButton ?? true)
    ) {
      isVariableRef.current = true;
      onValueChangeDebounced(newValue as Value<HasVariable>);
      return;
    }

    isVariableRef.current = false;
    const numberedValue = Number.parseFloat(newValue);
    if (isNaN(numberedValue)) return;
    onValueChangeDebounced(numberedValue as Value<HasVariable>);
  };

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return;
    const newValue = `{{${variable.name}}}`;
    setValue(newValue);
    isVariableRef.current = true;
    onValueChange(newValue as Value<HasVariable>);
  };

  const isValueVariable =
    value.startsWith("{{") && value.endsWith("}}") && value.length > 4;

  const CustomInput = () => {
    return (
      <input
        ref={inputRef}
        className="bg-transparent border-none outline-none w-full disabled:cursor-not-allowed row-span-2"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleValueChange(e.target.value)}
      />
    );
  };

  const Input = (
    <ArkNumberInput.Root
      value={isValueVariable ? "" : value}
      onValueChange={(details) => {
        if (!isValueVariable) {
          handleValueChange(details.value.toString());
        }
      }}
      className="w-full"
      {...props}
    >
      <ArkNumberInput.Control
        className="border rounded-md grid-cols-[1fr_32px] grid-rows-[1fr_1fr] focus-within:border-blue-500 overflow-hidden divide-x grid ps-3"
        style={{ width: width === "full" ? "100%" : width }}
      >
        {isValueVariable ? (
          <CustomInput />
        ) : (
          <ArkNumberInput.Input
            className="bg-transparent border-none outline-none w-full disabled:cursor-not-allowed row-span-2"
            placeholder={placeholder}
          />
        )}
        <ArkNumberInput.IncrementTrigger className="inline-flex items-center justify-center">
          <ChevronUpIcon className="size-4" />
        </ArkNumberInput.IncrementTrigger>
        <ArkNumberInput.DecrementTrigger className="inline-flex items-center justify-center border-t">
          <ChevronDownIcon className="size-4" />
        </ArkNumberInput.DecrementTrigger>
      </ArkNumberInput.Control>
    </ArkNumberInput.Root>
  );

  return (
    <FormControl
      as={direction === "column" ? Stack : HStack}
      isRequired={isRequired}
      justifyContent="space-between"
      width={label || width === "full" ? "full" : "auto"}
      spacing={direction === "column" ? 2 : 3}
    >
      {label && (
        <FormLabel display="flex" flexShrink={0} gap="1" mb="0" mr="0">
          {label}{" "}
          {moreInfoTooltip && (
            <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
          )}
        </FormLabel>
      )}
      <HStack w={direction === "row" ? undefined : "full"}>
        {(withVariableButton ?? true) ? (
          <HStack spacing="0" w="full">
            {Input}
            <VariablesButton onSelectVariable={handleVariableSelected} />
          </HStack>
        ) : (
          Input
        )}
        {suffix ? <Text>{suffix}</Text> : null}
      </HStack>
      {helperText ? <FormHelperText mt="0">{helperText}</FormHelperText> : null}
    </FormControl>
  );
};
