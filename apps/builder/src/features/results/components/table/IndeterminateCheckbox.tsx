import { Checkbox, Flex } from "@chakra-ui/react";
import React from "react";

const TableCheckBox = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { indeterminate, checked, ...rest }: any,
  ref: React.LegacyRef<HTMLInputElement>,
) => {
  const defaultRef = React.useRef();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
