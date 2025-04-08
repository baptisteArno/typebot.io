import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";
import type { ForgedBlockDefinition } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { useMemo } from "react";
import { findFetcher } from "../helpers/findFetcher";

export const useSelectItemsQuery = ({
  credentialsScope,
  blockDef,
  options,
  fetcherId,
}: {
  credentialsScope: "workspace" | "user";
  blockDef: ForgedBlockDefinition;
  options: ForgedBlock["options"];
  fetcherId: string;
}) => {
  const { workspace } = useWorkspace();

  const fetcher = useMemo(
    () => findFetcher(blockDef, fetcherId),
    [blockDef, fetcherId],
  );

  const { data } = trpc.forge.fetchSelectItems.useQuery(
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
    {
      enabled: !!workspace?.id && !!fetcher,
      onError: (error) => {
        if (error.data?.logError) toast(error.data.logError);
      },
    },
  );

  return {
    items: data?.items,
  };
};

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  if (!obj) return {} as Pick<T, K>;
  const ret: any = {};
  keys.forEach((key) => {
    ret[key] = obj[key];
  });
  return ret;
}
