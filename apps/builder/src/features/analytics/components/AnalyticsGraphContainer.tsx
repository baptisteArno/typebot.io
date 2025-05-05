import { ChangePlanModal } from "@/features/billing/components/ChangePlanModal";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Graph } from "@/features/graph/components/Graph";
import { GraphProvider } from "@/features/graph/providers/GraphProvider";
import { trpc } from "@/lib/trpc";
import {
  Flex,
  Spinner,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { isDefined } from "@typebot.io/lib/utils";
import type { Stats } from "@typebot.io/results/schemas/answers";
import React, { useMemo } from "react";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { typebot, publishedTypebot } = useTypebot();
  const { data } = trpc.analytics.getInDepthAnalyticsData.useQuery(
    {
      typebotId: typebot!.id,
      timeFilter,
      timeZone,
    },
    { enabled: isDefined(typebot?.id) && isDefined(publishedTypebot) },
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
    <Flex
      w="full"
      pos="relative"
      overflow="clip"
      bgColor={useColorModeValue("#f4f5f8", "gray.900")}
      backgroundImage={useColorModeValue(
        "radial-gradient(#c6d0e1 1px, transparent 0)",
        "radial-gradient(#2f2f39 1px, transparent 0)",
      )}
      backgroundSize="40px 40px"
      backgroundPosition="-19px -19px"
      h="full"
      justifyContent="center"
    >
      {publishedTypebot && stats ? (
        <GraphProvider isReadOnly isAnalytics>
          <Graph
            flex="1"
            typebot={publishedTypebot}
            onUnlockProPlanClick={onOpen}
            totalAnswers={data?.totalAnswers}
            edgesWithTotalUsers={edgesWithTotalUsers}
          />
        </GraphProvider>
      ) : (
        <Flex
          justify="center"
          align="center"
          boxSize="full"
          bgColor="rgba(255, 255, 255, 0.5)"
        >
          <Spinner color="gray" />
        </Flex>
      )}
      <ChangePlanModal
        onClose={onClose}
        isOpen={isOpen}
        type={t("billing.limitMessage.analytics")}
        excludedPlans={["STARTER"]}
      />
      <StatsCards
        stats={stats}
        pos="absolute"
        top="1rem"
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
      />
    </Flex>
  );
};
