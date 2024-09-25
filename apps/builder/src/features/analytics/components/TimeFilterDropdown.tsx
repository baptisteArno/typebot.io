import { DropdownList } from "@/components/DropdownList";
import type { ButtonProps } from "@chakra-ui/react";
import { timeFilterLabels, type timeFilterValues } from "../constants";

type Props = {
  timeFilter: (typeof timeFilterValues)[number];
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void;
} & ButtonProps;

export const TimeFilterDropdown = ({
  timeFilter,
  onTimeFilterChange,
  ...props
}: Props) => (
  <DropdownList
    items={Object.entries(timeFilterLabels).map(([value, label]) => ({
      label,
      value,
    }))}
    currentItem={timeFilter}
    onItemSelect={(val) =>
      onTimeFilterChange(val as (typeof timeFilterValues)[number])
    }
    {...props}
  />
);
