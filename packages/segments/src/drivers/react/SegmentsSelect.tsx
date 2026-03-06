import type { SegmentId } from "@typebot.io/shared-primitives/domain";
import { Select } from "@typebot.io/ui/components/Select";
import type { Segment } from "../../domain/Segment";

type Props = {
  segments: readonly Segment[];
  value: SegmentId;
  onChange: (segmentId: SegmentId) => void;
};
export const SegmentsSelect = ({ segments, value, onChange }: Props) => {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger />
      <Select.Content>
        {segments.map((segment) => (
          <Select.Item key={segment.id} value={segment.id}>
            {segment.name}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
};
