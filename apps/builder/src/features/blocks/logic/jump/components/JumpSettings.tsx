import { Select } from "@/components/inputs/Select";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack } from "@chakra-ui/react";
import type { JumpBlock } from "@typebot.io/blocks-logic/jump/schema";
import { byId } from "@typebot.io/lib/utils";
import { isSingleVariable } from "@typebot.io/variables/isSingleVariable";
import React, { useMemo } from "react";
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
    <Stack spacing={4}>
      <GroupsDropdown
        groups={typebot.groups}
        groupId={options?.groupId}
        onChange={handleGroupIdChange}
      />
      {selectedGroup &&
        (selectedGroup.blocks.length > 1 || options?.blockId) && (
          <Select
            selectedItem={options?.blockId}
            items={selectedGroup.blocks.map((block, index) => ({
              label: `Block #${(index + 1).toString()}`,
              value: block.id,
              icon: <BlockIcon type={block.type} />,
            }))}
            onSelect={handleBlockIdChange}
            placeholder="Select a block"
          />
        )}
    </Stack>
  );
};
