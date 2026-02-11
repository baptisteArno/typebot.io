import { useQuery } from "@tanstack/react-query";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { type ReactNode, useMemo } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { orpc } from "@/lib/queryClient";
import { findFetcher } from "../helpers/findFetcher";

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
  const { workspace } = useWorkspace();

  const fetcher = useMemo(
    () => findFetcher(blockDef, fetcherId),
    [blockDef, fetcherId],
  );

  const { data } = useQuery(
    orpc.forge.fetchSelectItems.queryOptions({
      input:
        credentialsScope === "workspace"
          ? {
              scope: "workspace",
              integrationId: blockDef.id,
              options: pick(
                options,
                (blockDef.auth ? ["credentialsId"] : []).concat(
                  fetcher?.dependencies ?? [],
                ),
              ),
              workspaceId: workspace?.id as string,
              fetcherId,
            }
          : {
              scope: "user",
              integrationId: blockDef.id,
              options: {
                credentialsId: options.credentialsId,
              },
              fetcherId,
            },
      enabled: !!workspace?.id && !!fetcher,
    }),
  );
  const shouldIncludeVariables =
    withVariableButton && (data?.items?.length ?? 0) > 0;

  return (
    <BasicSelect
      items={
        (data?.items ?? []) as {
          label: ReactNode;
          value: string;
        }[]
      }
      value={defaultValue}
      onChange={onChange}
      includeVariables={shouldIncludeVariables}
      placeholder={placeholder}
      className="flex-1"
    />
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
