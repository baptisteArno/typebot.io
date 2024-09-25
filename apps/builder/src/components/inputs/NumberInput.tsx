import { VariablesButton } from "@/features/variables/components/VariablesButton";
import {
  NumberInput as ChakraNumberInput,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  type NumberInputProps,
  NumberInputStepper,
  Stack,
  Text,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import type { Variable, VariableString } from "@typebot.io/variables/schemas";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
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
  onValueChange: (value?: Value<HasVariable>) => void;
} & Omit<
  NumberInputProps,
  "defaultValue" | "value" | "onChange" | "isRequired"
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
  ...props
}: Props<HasVariable>) => {
  const [isTouched, setIsTouched] = useState(false);
  const [value, setValue] = useState(defaultValue?.toString() ?? "");

  const onValueChangeDebounced = useDebouncedCallback(
    onValueChange,
    env.NEXT_PUBLIC_E2E_TEST ? 0 : debounceTimeout,
  );

  useEffect(() => {
    if (isTouched || value !== "" || !defaultValue) return;
    setValue(defaultValue?.toString() ?? "");
  }, [defaultValue, isTouched, value]);

  useEffect(
    () => () => {
      onValueChangeDebounced.flush();
    },
    [onValueChangeDebounced],
  );

  const handleValueChange = (newValue: string) => {
    if (!isTouched) setIsTouched(true);
    if (value.startsWith("{{") && value.endsWith("}}") && newValue !== "")
      return;
    setValue(newValue);
    if (newValue.endsWith(".") || newValue.endsWith(",")) return;
    if (newValue === "") return onValueChangeDebounced(undefined);
    if (
      newValue.startsWith("{{") &&
      newValue.endsWith("}}") &&
      newValue.length > 4 &&
      (withVariableButton ?? true)
    ) {
      onValueChangeDebounced(newValue as Value<HasVariable>);
      return;
    }
    const numberedValue = Number.parseFloat(newValue);
    if (isNaN(numberedValue)) return;
    onValueChangeDebounced(numberedValue);
  };

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return;
    const newValue = `{{${variable.name}}}`;
    handleValueChange(newValue);
  };

  const Input = (
    <ChakraNumberInput
      onChange={handleValueChange}
      value={value}
      w="full"
      {...props}
    >
      <NumberInputField placeholder={props.placeholder} />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </ChakraNumberInput>
  );

  return (
    <FormControl
      as={direction === "column" ? Stack : HStack}
      isRequired={isRequired}
      justifyContent="space-between"
      width={label || props.width === "full" ? "full" : "auto"}
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
