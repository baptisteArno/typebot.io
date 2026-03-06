import { Button } from "@typebot.io/ui/components/Button";
import { Empty } from "@typebot.io/ui/components/Empty";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";

type Props = {
  onAddClick: () => void;
  className?: string;
};

export const EmptyContacts = ({ onAddClick, className }: Props) => {
  return (
    <Empty.Root className={className}>
      <Empty.Header>
        <Empty.Title>No contacts yet</Empty.Title>
        <Empty.Description>
          Add contacts to manage your recipients.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={onAddClick}>
          <PlusSignIcon />
          Add contacts
        </Button>
      </Empty.Content>
    </Empty.Root>
  );
};
