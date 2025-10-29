import type { JumpBlock } from "@typebot.io/blocks-logic/jump/schema";
import { byId } from "@typebot.io/lib/utils";
import { isSingleVariable } from "@typebot.io/variables/isSingleVariable";
import { useMemo } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { GroupsDropdown } from "../../typebotLink/components/GroupsDropdown";

type Props = {
  options: JumpBlock["options"];
  onOptionsChange: (options: JumpBlock["options"]) => void;
};

export const JumpSettings = ({ options, onOptionsChange }: Props) => {
  const { typebot } = useTypebot();

  const handleGroupIdChange = (groupId?: string) =>
    onOptionsChange({ ...options, groupId });

  const handleBlockIdChange = (blockId?: string) =>
    onOptionsChange({ ...options, blockId });

  const selectedGroup = useMemo(() => {
    if (!options?.groupId || isSingleVariable(options?.groupId)) return;
    return typebot?.groups.find(byId(options?.groupId));
  }, [options?.groupId, typebot?.groups]);

  if (!typebot) return null;
  return (
    <div className="flex flex-col gap-4">
      <GroupsDropdown
        groups={typebot.groups}
        groupId={options?.groupId}
        onChange={handleGroupIdChange}
      />
      {selectedGroup &&
        (selectedGroup.blocks.length > 1 || options?.blockId) && (
          <BasicSelect
            value={options?.blockId}
            items={selectedGroup.blocks.map((block, index) => ({
              label: `Block #${(index + 1).toString()}`,
              value: block.id,
              icon: <BlockIcon type={block.type} />,
            }))}
            onChange={handleBlockIdChange}
            placeholder="Select a block"
          />
        )}
    </div>
  );
};
