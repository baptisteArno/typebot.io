import { useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { isDefined } from "@typebot.io/lib/utils";
import type { Stats } from "@typebot.io/results/schemas/answers";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { LoaderCircleIcon } from "@typebot.io/ui/icons/LoaderCircleIcon";
import { useMemo } from "react";
import { ChangePlanDialog } from "@/features/billing/components/ChangePlanDialog";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Graph } from "@/features/graph/components/Graph";
import { GraphProvider } from "@/features/graph/providers/GraphProvider";
import { useThemeValue } from "@/hooks/useThemeValue";
import { trpc } from "@/lib/queryClient";
import type { timeFilterValues } from "../constants";
import { populateEdgesWithTotalVisits } from "../helpers/populateEdgesWithTotalVisits";
import { StatsCards } from "./StatsCards";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

type Props = {
  timeFilter: (typeof timeFilterValues)[number];
  onTimeFilterChange: (timeFilter: (typeof timeFilterValues)[number]) => void;
  stats?: Stats;
};

export const AnalyticsGraphContainer = ({
  timeFilter,
  onTimeFilterChange,
  stats,
}: Props) => {
  const { t } = useTranslate();
  const { isOpen, onOpen, onClose } = useOpenControls();
  const { typebot, publishedTypebot } = useTypebot();
  const backgroundImage = useThemeValue(
    "radial-gradient(var(--gray-7) 1px, transparent 0)",
    "radial-gradient(var(--gray-5) 1px, transparent 0)",
  );
  const { data } = useQuery(
    trpc.analytics.getInDepthAnalyticsData.queryOptions(
      {
        typebotId: typebot!.id,
        timeFilter,
        timeZone,
      },
      { enabled: isDefined(typebot?.id) && isDefined(publishedTypebot) },
    ),
  );

  const edgesWithTotalUsers = useMemo(() => {
    if (
      !publishedTypebot?.edges ||
      !publishedTypebot.groups ||
      !publishedTypebot.events ||
      !data?.totalAnswers ||
      !stats?.totalViews
    )
      return;
    const firstEdgeId = publishedTypebot.events[0].outgoingEdgeId;
    if (!firstEdgeId) return;
    return populateEdgesWithTotalVisits({
      initialEdge: {
        id: firstEdgeId,
        total: stats.totalViews,
      },
      offDefaultPathEdgeWithTotalVisits: data.offDefaultPathVisitedEdges,
      edges: publishedTypebot.edges,
      groups: publishedTypebot.groups,
      totalAnswers: data.totalAnswers,
      // logger: console.log,
    });
  }, [
    data?.offDefaultPathVisitedEdges,
    data?.totalAnswers,
    publishedTypebot?.edges,
    publishedTypebot?.groups,
    publishedTypebot?.events,
    stats?.totalViews,
  ]);

  return (
    <div
      className="flex w-full relative h-full justify-center overflow-clip bg-gray-3 dark:bg-gray-2"
      style={{
        backgroundImage: backgroundImage,
        backgroundSize: "40px 40px",
        backgroundPosition: "-19px -19px",
      }}
    >
      {publishedTypebot && stats ? (
        <GraphProvider isReadOnly isAnalytics>
          <Graph
            className="flex-1"
            typebot={publishedTypebot}
            onUnlockProPlanClick={onOpen}
            totalAnswers={data?.totalAnswers}
            edgesWithTotalUsers={edgesWithTotalUsers}
          />
        </GraphProvider>
      ) : (
        <div className="flex justify-center items-center size-full bg-white/50">
          <LoaderCircleIcon className="animate-spin" />
        </div>
      )}
      <ChangePlanDialog
        onClose={onClose}
        isOpen={isOpen}
        type={t("billing.limitMessage.analytics")}
        excludedPlans={["STARTER"]}
      />
      <StatsCards
        stats={stats}
        className="absolute top-4"
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
      />
    </div>
  );
};
