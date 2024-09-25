/* eslint-disable @typescript-eslint/no-explicit-any */
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { Select } from "@/components/inputs/Select";
import { VariablesButton } from "@/features/variables/components/VariablesButton";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useToast } from "@/hooks/useToast";
import { trpc } from "@/lib/trpc";
import {
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Stack,
} from "@chakra-ui/react";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { type ReactNode, useMemo } from "react";
import { findFetcher } from "../helpers/findFetcher";

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
  onChange: (value: string | undefined) => void;
};
export const ForgeSelectInput = ({
  defaultValue,
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
  const { workspace } = useWorkspace();
  const { showToast } = useToast();

  const fetcher = useMemo(
    () => findFetcher(blockDef, fetcherId),
    [blockDef, fetcherId],
  );

  const { data } = trpc.forge.fetchSelectItems.useQuery(
    {
      integrationId: blockDef.id,
      options: pick(
        options,
        (blockDef.auth ? ["credentialsId"] : []).concat(
          fetcher?.dependencies ?? [],
        ),
      ),
      workspaceId: workspace?.id as string,
      fetcherId,
    },
    {
      enabled: !!workspace?.id && !!fetcher,
      onError: (error) => {
        showToast({
          description: error.message,
          status: "error",
        });
      },
    },
  );

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
          items={data?.items}
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

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  if (!obj) return {} as Pick<T, K>;
  const ret: any = {};
  keys.forEach((key) => {
    ret[key] = obj[key];
  });
  return ret;
}
