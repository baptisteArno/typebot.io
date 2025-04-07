import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { Select } from "@/components/inputs/Select";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Stack,
} from "@chakra-ui/react";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import type { ReactNode } from "react";
import { useSelectItemsQuery } from "../hooks/useSelectItemsQuery";

type Props = {
  blockDef: ForgedBlockDefinition;
  defaultValue?: string;
  fetcherId: string;
  options: ForgedBlock["options"];
  placeholder?: string;
  label?: string;
  helperText?: ReactNode;
  moreInfoTooltip?: string;
  direction?: "row" | "column";
  isRequired?: boolean;
  width?: "full";
  withVariableButton?: boolean;
  credentialsScope: "workspace" | "user";
  onChange: (value: string | undefined) => void;
};
export const ForgeSelectInput = ({
  defaultValue,
  credentialsScope,
  fetcherId,
  options,
  blockDef,
  placeholder,
  label,
  helperText,
  moreInfoTooltip,
  isRequired,
  direction = "column",
  width,
  withVariableButton = false,
  onChange,
}: Props) => {
  const { items } = useSelectItemsQuery({
    credentialsScope,
    blockDef,
    options,
    fetcherId,
  });

  return (
    <FormControl
      isRequired={isRequired}
      as={direction === "column" ? Stack : HStack}
      justifyContent="space-between"
      width={label || width === "full" ? "full" : "auto"}
      spacing={direction === "column" ? 2 : 3}
    >
      {label && (
        <FormLabel mb="0" mr="0" flexShrink={0}>
          {label}{" "}
          {moreInfoTooltip && (
            <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
          )}
        </FormLabel>
      )}
      <HStack spacing="0">
        <Select
          items={items}
          selectedItem={defaultValue}
          onSelect={onChange}
          placeholder={placeholder}
        />
        {withVariableButton ? (
          <VariablesButton
            onSelectVariable={(variable) => {
              onChange(`{{${variable.name}}}`);
            }}
          />
        ) : null}
      </HStack>
      {helperText && <FormHelperText mt="0">{helperText}</FormHelperText>}
    </FormControl>
  );
};
