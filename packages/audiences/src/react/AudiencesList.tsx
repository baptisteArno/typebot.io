import { Table } from "@typebot.io/ui/components/Table";
import type { Audience } from "../core/Audience";

type Props = {
  audiences: readonly Audience[];
};
export const AudiencesList = ({ audiences }: Props) => {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {audiences.map((audience) => (
          <Table.Row key={audience.id}>
            <Table.Cell>{audience.name}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};
