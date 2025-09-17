import {
  type GridProps,
  SimpleGrid,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { Stats } from "@typebot.io/results/schemas/answers";
import type { timeFilterValues } from "../constants";
import { TimeFilterSelect } from "./TimeFilterSelect";

const computeCompletionRate =
  (notAvailableLabel: string) =>
  (totalCompleted: number, totalStarts: number): string => {
    if (totalStarts === 0) return notAvailableLabel;
    return `${Math.round((totalCompleted / totalStarts) * 100)}%`;
  };

export const StatsCards = ({
  stats,
  timeFilter,
  onTimeFilterChange,
  ...props
}: {
  stats?: Stats;
  timeFilter: (typeof timeFilterValues)[number];
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void;
} & GridProps) => {
  const { t } = useTranslate();
  const bg = useColorModeValue("white", "gray.950");

  return (
    <SimpleGrid
      columns={{ base: 1, md: 4 }}
      spacing="6"
      alignItems="center"
      {...props}
    >
      <Stat bgColor={bg} p="4" rounded="md" boxShadow="md" borderWidth={1}>
        <StatLabel>{t("analytics.viewsLabel")}</StatLabel>
        {stats ? (
          <StatNumber>{stats.totalViews}</StatNumber>
        ) : (
          <Skeleton w="50%" h="10px" mt="2" />
        )}
      </Stat>
      <Stat bgColor={bg} p="4" rounded="md" boxShadow="md" borderWidth={1}>
        <StatLabel>{t("analytics.startsLabel")}</StatLabel>
        {stats ? (
          <StatNumber>{stats.totalStarts}</StatNumber>
        ) : (
          <Skeleton w="50%" h="10px" mt="2" />
        )}
      </Stat>
      <Stat bgColor={bg} p="4" rounded="md" boxShadow="md" borderWidth={1}>
        <StatLabel>{t("analytics.completionRateLabel")}</StatLabel>
        {stats ? (
          <StatNumber>
            {computeCompletionRate(t("analytics.notAvailableLabel"))(
              stats.totalCompleted,
              stats.totalStarts,
            )}
          </StatNumber>
        ) : (
          <Skeleton w="50%" h="10px" mt="2" />
        )}
      </Stat>
      <TimeFilterSelect
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
        className="shadow-md bg-gray-1"
      />
    </SimpleGrid>
  );
};
