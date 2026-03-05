import { Button } from "@typebot.io/ui/components/Button";

type Props = {
  onSubmitSuccess: () => void;
};
export const CampaignsDetailsFormStep = ({ onSubmitSuccess }: Props) => {
  return (
    <div>
      <h1>Campaigns Details</h1>
      <Button onClick={onSubmitSuccess}>Submit</Button>
    </div>
  );
};
