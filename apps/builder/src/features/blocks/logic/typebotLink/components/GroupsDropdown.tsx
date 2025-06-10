import { BasicSelect } from "@/components/inputs/BasicSelect";
import { Input } from "@chakra-ui/react";
import type { Group } from "@typebot.io/groups/schemas";
import { isNotEmpty } from "@typebot.io/lib/utils";

type Props = {
  groups: Group[];
  groupId?: string;
  onChange: (groupId: string | undefined) => void;
  isLoading?: boolean;
};

export const GroupsDropdown = ({
  groups,
  groupId,
  onChange,
  isLoading,
}: Props) => {
  if (isLoading) return <Input value="Loading..." isDisabled />;
  if (!groups || groups.length === 0)
    return <Input value="No groups found" isDisabled />;
  return (
    <BasicSelect
      items={groups
        .filter((group) => group.id !== groupId && isNotEmpty(group.title))
        .map((group) => ({
          label: group.title,
          value: group.id,
        }))}
      defaultValue={groupId}
      onChange={onChange}
      placeholder="Select a group"
    />
  );
};
