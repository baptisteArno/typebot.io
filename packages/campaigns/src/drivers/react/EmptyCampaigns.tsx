import { Button } from "@typebot.io/ui/components/Button";
import { Empty } from "@typebot.io/ui/components/Empty";
import { PlusSignIcon } from "@typebot.io/ui/icons/PlusSignIcon";

type Props = {
  onCreateClick: () => void;
  className?: string;
};

export const EmptyCampaigns = ({ onCreateClick, className }: Props) => {
  return (
    <Empty.Root className={className}>
      <Empty.Header>
        <Empty.Title>No campaigns yet</Empty.Title>
        <Empty.Description>
          Start reaching many recipients at once by creating and sending a
          campaign.
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={onCreateClick}>
          <PlusSignIcon />
          Create campaign
        </Button>
      </Empty.Content>
    </Empty.Root>
  );
};
