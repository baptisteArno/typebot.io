import { useQuery } from "@tanstack/react-query";
import { defaultTypebotLinkOptions } from "@typebot.io/blocks-logic/typebotLink/constants";
import type { TypebotLinkBlock } from "@typebot.io/blocks-logic/typebotLink/schema";
import { isNotEmpty } from "@typebot.io/lib/utils";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpc } from "@/lib/queryClient";
import { GroupsDropdown } from "./GroupsDropdown";
import { TypebotsDropdown } from "./TypebotsDropdown";

type Props = {
  options: TypebotLinkBlock["options"];
  onOptionsChange: (options: TypebotLinkBlock["options"]) => void;
};

export const TypebotLinkForm = ({ options, onOptionsChange }: Props) => {
  const { typebot } = useTypebot();

  const handleTypebotIdChange = async (
    typebotId: string | "current" | undefined,
  ) => onOptionsChange({ ...options, typebotId, groupId: undefined });

  const { data: linkedTypebotData } = useQuery(
    trpc.typebot.getTypebot.queryOptions(
      {
        typebotId: options?.typebotId as string,
      },
      {
        enabled:
          isNotEmpty(options?.typebotId) && options?.typebotId !== "current",
      },
    ),
  );

  const handleGroupIdChange = (groupId: string | undefined) =>
    onOptionsChange({ ...options, groupId });

  const updateMergeResults = (mergeResults: boolean) =>
    onOptionsChange({ ...options, mergeResults });

  const isCurrentTypebotSelected =
    (typebot && options?.typebotId === typebot.id) ||
    options?.typebotId === "current";

  return (
    <div className="flex flex-col gap-2">
      {typebot && (
        <TypebotsDropdown
          idsToExclude={[typebot.id]}
          typebotId={options?.typebotId}
          onSelect={handleTypebotIdChange}
          currentWorkspaceId={typebot.workspaceId as string}
        />
      )}
      {options?.typebotId && (
        <GroupsDropdown
          key={options.typebotId}
          groups={
            typebot && isCurrentTypebotSelected
              ? typebot.groups
              : (linkedTypebotData?.typebot?.groups ?? [])
          }
          groupId={options.groupId}
          onChange={handleGroupIdChange}
          isLoading={
            linkedTypebotData?.typebot === undefined &&
            options.typebotId !== "current" &&
            typebot &&
            typebot.id !== options.typebotId
          }
        />
      )}
      {!isCurrentTypebotSelected && (
        <Field.Root className="flex-row items-center">
          <Switch
            checked={
              options?.mergeResults ?? defaultTypebotLinkOptions.mergeResults
            }
            onCheckedChange={updateMergeResults}
          />
          <Field.Label>
            Merge answers{" "}
            <MoreInfoTooltip>
              If enabled, the answers collected in the linked typebot will be
              merged with the results of the current typebot.
            </MoreInfoTooltip>
          </Field.Label>
        </Field.Root>
      )}
    </div>
  );
};
