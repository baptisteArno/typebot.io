import { Button } from "@typebot.io/ui/components/Button";
import { Empty } from "@typebot.io/ui/components/Empty";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";

type Props = {
  onCreateClick: () => void;
};

export const EmptySpaceState = ({ onCreateClick }: Props) => {
  return (
    <Empty.Root>
      <Empty.Header>
        <Empty.Title>No spaces yet</Empty.Title>
        <Empty.Description>
          Create spaces to organize your typebots. A space could be a team, a
          client, a project, etc.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={onCreateClick}>
          <PlusSignIcon />
          Create space
        </Button>
      </Empty.Content>
    </Empty.Root>
  );
};
