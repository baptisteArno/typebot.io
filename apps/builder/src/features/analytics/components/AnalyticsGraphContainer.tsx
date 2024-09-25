import { ChangePlanModal } from "@/features/billing/components/ChangePlanModal";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Graph } from "@/features/graph/components/Graph";
import { EventsCoordinatesProvider } from "@/features/graph/providers/EventsCoordinateProvider";
import { GraphProvider } from "@/features/graph/providers/GraphProvider";
import { trpc } from "@/lib/trpc";
import {
  Flex,
  Spinner,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { blockHasItems, isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import type { Stats } from "@typebot.io/results/schemas/answers";
import type {
  TotalAnswers,
  TotalVisitedEdges,
} from "@typebot.io/schemas/features/analytics";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import React, { useMemo } from "react";
import type { timeFilterValues } from "../constants";
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
      typebotId: typebot?.id as string,
      timeFilter,
      timeZone,
    },
    { enabled: isDefined(publishedTypebot) },
  );

  const totalVisitedEdges = useMemo(() => {
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
    return populateEdgesWithVisitData({
      edgeId: firstEdgeId,
      edges: publishedTypebot.edges,
      groups: publishedTypebot.groups,
      currentTotalUsers: stats.totalViews,
      totalVisitedEdges: data.offDefaultPathVisitedEdges
        ? [...data.offDefaultPathVisitedEdges]
        : [],
      totalAnswers: data.totalAnswers,
      edgeVisitHistory: [],
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
      bgColor={useColorModeValue("#f4f5f8", "gray.850")}
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
          <EventsCoordinatesProvider events={publishedTypebot?.events}>
            <Graph
              flex="1"
              typebot={publishedTypebot}
              onUnlockProPlanClick={onOpen}
              totalAnswers={data?.totalAnswers}
              totalVisitedEdges={totalVisitedEdges}
            />
          </EventsCoordinatesProvider>
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
        timeFilter={timeFilter}
        onTimeFilterChange={onTimeFilterChange}
      />
    </Flex>
  );
};

const populateEdgesWithVisitData = ({
  edgeId,
  edges,
  groups,
  currentTotalUsers,
  totalVisitedEdges,
  totalAnswers,
  edgeVisitHistory,
}: {
  edgeId: string;
  edges: Edge[];
  groups: GroupV6[];
  currentTotalUsers: number;
  totalVisitedEdges: TotalVisitedEdges[];
  totalAnswers: TotalAnswers[];
  edgeVisitHistory: string[];
}): TotalVisitedEdges[] => {
  if (edgeVisitHistory.find((e) => e === edgeId)) return totalVisitedEdges;
  totalVisitedEdges.push({
    edgeId,
    total: currentTotalUsers,
  });
  edgeVisitHistory.push(edgeId);
  const edge = edges.find((edge) => edge.id === edgeId);
  if (!edge) return totalVisitedEdges;
  const group = groups.find((group) => edge?.to.groupId === group.id);
  if (!group) return totalVisitedEdges;
  for (const block of edge.to.blockId
    ? group.blocks.slice(
        group.blocks.findIndex((b) => b.id === edge.to.blockId),
      )
    : group.blocks) {
    if (blockHasItems(block)) {
      for (const item of block.items) {
        if (item.outgoingEdgeId) {
          totalVisitedEdges = populateEdgesWithVisitData({
            edgeId: item.outgoingEdgeId,
            edges,
            groups,
            currentTotalUsers:
              totalVisitedEdges.find(
                (tve) => tve.edgeId === item.outgoingEdgeId,
              )?.total ?? 0,
            totalVisitedEdges,
            totalAnswers,
            edgeVisitHistory,
          });
        }
      }
    }
    if (block.outgoingEdgeId) {
      const totalUsers = isInputBlock(block)
        ? totalAnswers.find((a) => a.blockId === block.id)?.total
        : currentTotalUsers;
      totalVisitedEdges = populateEdgesWithVisitData({
        edgeId: block.outgoingEdgeId,
        edges,
        groups,
        currentTotalUsers: totalUsers ?? 0,
        totalVisitedEdges,
        totalAnswers,
        edgeVisitHistory,
      });
    }
  }

  return totalVisitedEdges;
};
