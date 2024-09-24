import { Select } from "@/components/inputs/Select";
import { Input } from "@chakra-ui/react";
import type { Group } from "@typebot.io/groups/schemas";

type Props = {
  groups: Group[];
  groupId?: string;
  onGroupIdSelected: (groupId: string | undefined) => void;
  isLoading?: boolean;
};

export const GroupsDropdown = ({
  groups,
  groupId,
  onGroupIdSelected,
  isLoading,
}: Props) => {
  if (isLoading) return <Input value="Loading..." isDisabled />;
  if (!groups || groups.length === 0)
    return <Input value="No groups found" isDisabled />;
  return (
    <Select
      selectedItem={groupId}
      items={(groups ?? []).map((group) => ({
        label: group.title,
        value: group.id,
      }))}
      onSelect={onGroupIdSelected}
      placeholder={"Select a group"}
    />
  );
};
