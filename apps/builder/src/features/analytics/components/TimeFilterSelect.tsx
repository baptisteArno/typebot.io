import {
  type TimeFilter,
  timeFilterLabels,
  timeFilterValues,
} from "@typebot.io/results/timeFilter";
import { BasicSelect } from "@/components/inputs/BasicSelect";

type Props = {
  timeFilter: TimeFilter;
  className?: string;
  onTimeFilterChange: (timeFilter: TimeFilter) => void;
};

export const TimeFilterSelect = ({
  timeFilter,
  className,
  onTimeFilterChange,
}: Props) => (
  <BasicSelect
    items={timeFilterValues.map((value) => ({
      label: timeFilterLabels[value],
      value,
    }))}
    value={timeFilter}
    onChange={onTimeFilterChange}
    className={className}
  />
);
