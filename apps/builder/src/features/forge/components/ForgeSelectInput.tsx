import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { BasicSelect } from "@/components/inputs/BasicSelect";
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

  console.log(credentialsScope, blockDef, options, fetcherId);

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
        <BasicSelect
          items={
            (items ?? []) as {
              label: ReactNode;
              value: string;
            }[]
          }
          value={defaultValue}
          onChange={onChange}
          includeVariables={withVariableButton}
          placeholder={placeholder}
          className="flex-1"
        />
      </HStack>
      {helperText && <FormHelperText mt="0">{helperText}</FormHelperText>}
    </FormControl>
  );
};
