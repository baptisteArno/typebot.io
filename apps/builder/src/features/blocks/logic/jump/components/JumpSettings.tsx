import { Select } from "@/components/inputs/Select";
import { BlockIcon } from "@/features/editor/components/BlockIcon";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Stack } from "@chakra-ui/react";
import type { JumpBlock } from "@typebot.io/blocks-logic/jump/schema";
import { byId, isNotEmpty } from "@typebot.io/lib/utils";
import React from "react";

type Props = {
  groupId: string;
  options: JumpBlock["options"];
  onOptionsChange: (options: JumpBlock["options"]) => void;
};

export const JumpSettings = ({ groupId, options, onOptionsChange }: Props) => {
  const { typebot } = useTypebot();

  const handleGroupIdChange = (groupId?: string) =>
    onOptionsChange({ ...options, groupId });

  const handleBlockIdChange = (blockId?: string) =>
    onOptionsChange({ ...options, blockId });

  const currentGroupId = typebot?.groups.find(byId(groupId))?.id;

  const selectedGroup = typebot?.groups.find(byId(options?.groupId));

  if (!typebot) return null;

  return (
    <Stack spacing={4}>
      <Select
        items={typebot.groups
          .filter(
            (group) => group.id !== currentGroupId && isNotEmpty(group.title),
          )
          .map((group) => ({
            label: group.title,
            value: group.id,
          }))}
        selectedItem={selectedGroup?.id}
        onSelect={handleGroupIdChange}
        placeholder="Select a group"
      />
      {selectedGroup && selectedGroup.blocks.length > 1 && (
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
