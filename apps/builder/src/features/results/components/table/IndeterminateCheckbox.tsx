import { Checkbox, Flex } from "@chakra-ui/react";
import React from "react";

const TableCheckBox = (
  { indeterminate, checked, ...rest }: any,
  ref: React.LegacyRef<HTMLInputElement>,
) => {
  const defaultRef = React.useRef();
  const resolvedRef: any = ref || defaultRef;

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
