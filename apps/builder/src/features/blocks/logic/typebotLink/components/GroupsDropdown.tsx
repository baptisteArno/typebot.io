import type { Group } from "@typebot.io/groups/schemas";
import { Input } from "@typebot.io/ui/components/Input";
import { BasicSelect } from "@/components/inputs/BasicSelect";

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
  if (isLoading) return <Input value="Loading..." disabled />;
  if (!groups || groups.length === 0)
    return <Input value="No groups found" disabled />;

  return (
    <BasicSelect
      items={groups.map((group) => ({
        label: group.title,
        value: group.id,
      }))}
      onChange={onChange}
      includeVariables
      value={groupId}
      placeholder="Select a group"
    />
  );
};
