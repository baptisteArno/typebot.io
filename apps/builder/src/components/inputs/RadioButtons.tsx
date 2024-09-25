import {
  Box,
  Flex,
  Stack,
  type UseRadioProps,
  useColorModeValue,
  useRadio,
  useRadioGroup,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

type Props<T extends string> = {
  options: readonly (T | { value: T; label: ReactNode })[];
  value?: T;
  defaultValue?: T;
  direction?: "row" | "column";
  size?: "md" | "sm";
  onSelect: (newValue: T) => void;
};
export const RadioButtons = <T extends string>({
  options,
  value,
  defaultValue,
  direction = "row",
  size = "md",
  onSelect,
}: Props<T>) => {
  const { getRootProps, getRadioProps } = useRadioGroup({
    value,
    defaultValue,
    onChange: onSelect,
  });

  const group = getRootProps();

  return (
    <Stack {...group} direction={direction}>
      {options.map((item) => {
        const radio = getRadioProps({ value: parseValue(item) });
        return (
          <RadioCard key={parseValue(item)} {...radio} size={size}>
            {parseLabel(item)}
          </RadioCard>
        );
      })}
    </Stack>
  );
};

export const RadioCard = (
  props: UseRadioProps & { children: ReactNode; size?: "md" | "sm" },
) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label" flex="1">
      <input {...input} />
      <Flex
        {...checkbox}
        cursor="pointer"
        borderWidth="2px"
        borderRadius="md"
        _checked={{
          borderColor: "blue.400",
        }}
        _hover={{
          bgColor: useColorModeValue("gray.100", "gray.700"),
        }}
        _active={{
          bgColor: useColorModeValue("gray.200", "gray.600"),
        }}
        px={props.size === "sm" ? 3 : 5}
        py={props.size === "sm" ? 1 : 2}
        transition="background-color 150ms, color 150ms, border 150ms"
        justifyContent="center"
        fontSize={props.size === "sm" ? "sm" : undefined}
      >
        {props.children}
      </Flex>
    </Box>
  );
};

const parseValue = (item: string | { value: string; label: ReactNode }) =>
  typeof item === "string" ? item : item.value;

const parseLabel = (item: string | { value: string; label: ReactNode }) =>
  typeof item === "string" ? item : item.label;
