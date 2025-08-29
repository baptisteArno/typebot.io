import { BasicSelect } from "@/components/inputs/BasicSelect";
import type { TriggerProps } from "@typebot.io/ui/components/Select";
import { timeFilterLabels, type timeFilterValues } from "../constants";

type Props = {
  timeFilter: (typeof timeFilterValues)[number];
  className?: string;
  size?: TriggerProps["size"];
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void;
};

export const TimeFilterSelect = ({
  timeFilter,
  className,
  size,
  onTimeFilterChange,
}: Props) => (
  <BasicSelect
    items={Object.entries(timeFilterLabels).map(([value, label]) => ({
      label,
      value: value as (typeof timeFilterValues)[number],
    }))}
    value={timeFilter}
    onChange={onTimeFilterChange}
    className={className}
    size={size}
  />
);
