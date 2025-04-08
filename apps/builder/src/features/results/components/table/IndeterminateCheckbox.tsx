import { Checkbox, type CheckboxProps, Flex } from "@chakra-ui/react";
import React from "react";

type TableCheckBoxProps = {
  indeterminate: boolean;
  checked: boolean;
} & Omit<CheckboxProps, "ref" | "isIndeterminate" | "isChecked">;

const TableCheckBox = (
  { indeterminate, checked, ...rest }: TableCheckBoxProps,
  ref: React.LegacyRef<HTMLInputElement>,
) => {
  const defaultRef = React.useRef();
  const resolvedRef = ref || defaultRef;

  return (
    <Flex justify="center" data-testid="checkbox">
      <Checkbox
        ref={resolvedRef}
        {...rest}
        isIndeterminate={indeterminate}
        isChecked={checked}
      />
    </Flex>
  );
};

export const IndeterminateCheckbox = React.forwardRef(TableCheckBox);
