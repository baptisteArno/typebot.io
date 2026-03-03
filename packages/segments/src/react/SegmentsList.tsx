import { Table } from "@typebot.io/ui/components/Table";
import type { Segment } from "../core/Segment";

type Props = {
  segments: readonly Segment[];
};
export const SegmentsList = ({ segments }: Props) => {
  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>ID</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {segments.map((segment) => (
          <Table.Row key={segment.id}>
            <Table.Cell>{segment.name}</Table.Cell>
            <Table.Cell>{segment.id}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};
