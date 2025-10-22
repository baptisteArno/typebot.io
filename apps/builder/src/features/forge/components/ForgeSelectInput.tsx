import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import type { ReactNode } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { useSelectItemsQuery } from "../hooks/useSelectItemsQuery";

type Props = {
  blockDef: ForgedBlockDefinition;
  defaultValue?: string;
  fetcherId: string;
  options: ForgedBlock["options"];
  placeholder?: string;
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
  );
};
