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
import { blockHasItems, isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import type { Stats } from "@typebot.io/results/schemas/answers";
import type {
  EdgeWithTotalUsers,
  TotalAnswers,
} from "@typebot.io/schemas/features/analytics";
import type {
  BlockSource,
  Edge,
  Target,
} from "@typebot.io/typebot/schemas/edge";
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
    return populateEdgesWithVisitData({
      edgeId: firstEdgeId,
      edges: publishedTypebot.edges,
      groups: publishedTypebot.groups,
      currentTotalUsers: stats.totalViews,
      offDefaultPathVisitedEdges: data.offDefaultPathVisitedEdges,
      edgesWithTotalUsers: [],
      totalAnswers: data.totalAnswers,
      edgeVisitHistory: [],
      depth: 0,
      // debug: true,
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
  edgesWithTotalUsers,
  offDefaultPathVisitedEdges,
  totalAnswers,
  edgeVisitHistory,
  depth,
  debug = false,
}: {
  edgeId: string;
  edges: Edge[];
  groups: GroupV6[];
  currentTotalUsers: number;
  edgesWithTotalUsers: EdgeWithTotalUsers[];
  offDefaultPathVisitedEdges: EdgeWithTotalUsers[];
  totalAnswers: TotalAnswers[];
  edgeVisitHistory: string[];
  depth: number;
  debug?: boolean;
}): EdgeWithTotalUsers[] => {
  if (edgeVisitHistory.find((e) => e === edgeId)) {
    if (debug)
      console.log(
        parseEdgeDebugLabel(edgeId, edges, groups),
        "already visited, adding",
        currentTotalUsers,
        { depth },
      );
    edgesWithTotalUsers = edgesWithTotalUsers.map((etw) =>
      etw.edgeId === edgeId
        ? { ...etw, total: etw.total + currentTotalUsers }
        : etw,
    );
  } else {
    if (debug)
      console.log(
        parseEdgeDebugLabel(edgeId, edges, groups),
        "never visited, pushing",
        currentTotalUsers,
        {
          depth,
        },
      );
    edgesWithTotalUsers.push({
      edgeId,
      total: currentTotalUsers,
    });
    edgeVisitHistory.push(edgeId);
  }

  const edge = edges.find((edge) => edge.id === edgeId);
  if (!edge) return edgesWithTotalUsers;
  const group = groups.find((group) => edge?.to.groupId === group.id);
  if (!group) return edgesWithTotalUsers;
  for (const block of edge.to.blockId
    ? group.blocks.slice(
        group.blocks.findIndex((b) => b.id === edge.to.blockId),
      )
    : group.blocks) {
    if (blockHasItems(block)) {
      for (const item of block.items) {
        if (item.outgoingEdgeId) {
          if (
            edgeVisitHistory.some((history) => history === item.outgoingEdgeId)
          )
            continue;
          const totalUsersOnEdge = offDefaultPathVisitedEdges.find(
            (tve) => tve.edgeId === item.outgoingEdgeId,
          )?.total;
          if (!totalUsersOnEdge || totalUsersOnEdge === 0) continue;
          edgesWithTotalUsers = populateEdgesWithVisitData({
            edgeId: item.outgoingEdgeId,
            edges,
            groups,
            offDefaultPathVisitedEdges,
            currentTotalUsers: totalUsersOnEdge,
            edgesWithTotalUsers,
            totalAnswers,
            edgeVisitHistory,
            depth: depth + 1,
            debug,
          });
        }
      }
    }
    if (block.outgoingEdgeId) {
      if (
        group.blocks.some((b) => isInputBlock(b)) &&
        edgeVisitHistory.some((history) => history === block.outgoingEdgeId)
      )
        continue;
      const totalUsers = isInputBlock(block)
        ? (totalAnswers.find((a) => a.blockId === block.id)?.total ?? 0) -
          computeAnswersFromItemsEdge({ block, offDefaultPathVisitedEdges })
        : currentTotalUsers;
      if (totalUsers === 0) continue;
      edgesWithTotalUsers = populateEdgesWithVisitData({
        edgeId: block.outgoingEdgeId,
        edges,
        groups,
        offDefaultPathVisitedEdges,
        currentTotalUsers: totalUsers,
        edgesWithTotalUsers,
        totalAnswers,
        edgeVisitHistory,
        depth: depth + 1,
        debug,
      });
    }
  }

  return edgesWithTotalUsers;
};

const computeAnswersFromItemsEdge = ({
  block,
  offDefaultPathVisitedEdges,
}: {
  block: InputBlock;
  offDefaultPathVisitedEdges: EdgeWithTotalUsers[];
}): number => {
  if (!blockHasItems(block)) return 0;
  return block.items.reduce((acc, item) => {
    const totalUsersOnEdge = offDefaultPathVisitedEdges.find(
      (tve) => tve.edgeId === item.outgoingEdgeId,
    )?.total;
    return acc + (totalUsersOnEdge ?? 0);
  }, 0);
};

const parseEdgeDebugLabel = (
  edgeId: string,
  edges: Edge[],
  groups: GroupV6[],
): string => {
  const edge = edges.find((edge) => edge.id === edgeId);
  if (!edge) throw new Error("Edge not found while debugging edge");

  let label = "[";

  // From
  if ("eventId" in edge.from) label += "Start";
  const fromBlock = groups
    .flatMap((g) => g.blocks)
    .find((block) => block.id === (edge.from as BlockSource).blockId);
  if (fromBlock) label += fromBlock?.type;

  // To
  const toGroup = groups.find(
    (group) => group.id === (edge.to as Target).groupId,
  );
  if (!toGroup) throw new Error("Group not found while debugging edge");
  label += " -> " + toGroup?.title;
  if (edge.to.blockId) {
    const toBlock = toGroup.blocks.find(
      (block) => block.id === (edge.to as Target).blockId,
    );
    if (toBlock) label += " > " + toBlock?.type;
  }

  label += "]";
  return label;
};
