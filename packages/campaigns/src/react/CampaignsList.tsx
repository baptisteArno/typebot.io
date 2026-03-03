import { Table } from "@typebot.io/ui/components/Table";
import type { Campaign } from "../core/Campaign";

type Props = {
  campaigns: readonly Campaign[];
};
export const CampaignsList = ({ campaigns }: Props) => {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {campaigns.map((campaign) => (
          <Table.Row key={campaign.id}>
            <Table.Cell>{campaign.name}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};
