import { useTranslate } from "@tolgee/react";
import type { Stats } from "@typebot.io/results/schemas/answers";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { cn } from "@typebot.io/ui/lib/cn";
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
  className,
}: {
  stats?: Stats;
  timeFilter: (typeof timeFilterValues)[number];
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void;
  className?: string;
}) => {
  const { t } = useTranslate();

  return (
    <div className={cn("flex gap-6 items-start ", className)}>
      <div className="bg-gray-1 flex py-2 px-4 rounded-md shadow-md border items-center justify-center gap-2">
        <p className="font-medium">{t("analytics.viewsLabel")}:</p>
        {stats ? <p>{stats.totalViews}</p> : <Skeleton className="w-8 h-2" />}
      </div>
      <div className="bg-gray-1 py-2 px-4 rounded-md shadow-md border flex items-center justify-center gap-2">
        <p className="font-medium">{t("analytics.startsLabel")}:</p>
        {stats ? <p>{stats.totalStarts}</p> : <Skeleton className="w-8 h-2" />}
      </div>
      <div className="bg-gray-1 py-2 px-4 rounded-md shadow-md border flex items-center justify-center gap-2">
        <p className="font-medium">{t("analytics.completionRateLabel")}:</p>
        {stats ? (
          <p>
            {computeCompletionRate(t("analytics.notAvailableLabel"))(
              stats.totalCompleted,
              stats.totalStarts,
            )}
          </p>
        ) : (
          <Skeleton className="w-1/2 h-2 mt-2" />
        )}
      </div>
      <TimeFilterSelect
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
        className="shadow-md bg-gray-1"
      />
    </div>
  );
};
