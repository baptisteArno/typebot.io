import { BasicSelect } from "@/components/inputs/BasicSelect";
import { timeFilterLabels, type timeFilterValues } from "../constants";

type Props = {
  timeFilter: (typeof timeFilterValues)[number];
  className?: string;
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void;
};

export const TimeFilterSelect = ({
  timeFilter,
  className,
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
  />
);
