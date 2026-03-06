import { Table } from "@typebot.io/ui/components/Table";
import type { Space } from "../../domain/Space";

type Props = {
  spaces: readonly Space[];
};

export const SpacesList = ({ spaces }: Props) => {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {spaces.map((space) => (
          <Table.Row key={space.id}>
            <Table.Cell>{space.name}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};
