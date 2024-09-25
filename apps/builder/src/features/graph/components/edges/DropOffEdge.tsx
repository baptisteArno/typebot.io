import { computeTotalUsersAtBlock } from "@/features/analytics/helpers/computeTotalUsersAtBlock";
import { getTotalAnswersAtBlock } from "@/features/analytics/helpers/getTotalAnswersAtBlock";
import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import {
  Tag,
  Text,
  Tooltip,
  VStack,
  theme,
  useColorModeValue,
} from "@chakra-ui/react";
import { blockHasItems } from "@typebot.io/blocks-core/helpers";
import { byId, isNotDefined } from "@typebot.io/lib/utils";
import type {
  TotalAnswers,
  TotalVisitedEdges,
} from "@typebot.io/schemas/features/analytics";
import React, { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { groupWidth } from "../../constants";
import { computeDropOffPath } from "../../helpers/computeDropOffPath";
import { computeSourceCoordinates } from "../../helpers/computeSourceCoordinates";
import { useGroupsStore } from "../../hooks/useGroupsStore";
import { useEndpoints } from "../../providers/EndpointsProvider";

export const dropOffBoxDimensions = {
  width: 100,
  height: 55,
};

export const dropOffSegmentLength = 80;
const dropOffSegmentMinWidth = 2;
const dropOffSegmentMaxWidth = 20;

export const dropOffStubLength = 30;

type Props = {
  blockId: string;
  totalVisitedEdges: TotalVisitedEdges[];
  totalAnswers: TotalAnswers[];
  onUnlockProPlanClick?: () => void;
};

export const DropOffEdge = ({
  totalVisitedEdges,
  totalAnswers,
  blockId,
  onUnlockProPlanClick,
}: Props) => {
  const dropOffColor = useColorModeValue(
    theme.colors.red[500],
    theme.colors.red[400],
  );
  const { workspace } = useWorkspace();
  const { publishedTypebot } = useTypebot();
  const currentBlockId = useMemo(
    () =>
      publishedTypebot?.groups.flatMap((g) => g.blocks)?.find(byId(blockId))
        ?.id,
    [blockId, publishedTypebot?.groups],
  );

  const groupId = publishedTypebot?.groups.find((group) =>
    group.blocks.some((block) => block.id === currentBlockId),
  )?.id;
  const groupCoordinates = useGroupsStore(
    useShallow((state) =>
      groupId && state.groupsCoordinates
        ? state.groupsCoordinates[groupId]
        : undefined,
    ),
  );
  const { sourceEndpointYOffsets: sourceEndpoints } = useEndpoints();

  const isWorkspaceProPlan = hasProPerks(workspace);

  const { totalDroppedUser, dropOffRate } = useMemo(() => {
    if (!publishedTypebot || !currentBlockId) return {};
    const totalUsersAtBlock = computeTotalUsersAtBlock(currentBlockId, {
      publishedTypebot,
      totalVisitedEdges,
      totalAnswers,
    });
    const totalBlockReplies = getTotalAnswersAtBlock(currentBlockId, {
      publishedTypebot,
      totalAnswers,
    });
    if (totalUsersAtBlock === 0) return {};
    const totalDroppedUser = totalUsersAtBlock - totalBlockReplies;

    return {
      totalDroppedUser,
      dropOffRate: Math.round((totalDroppedUser / totalUsersAtBlock) * 100),
    };
  }, [currentBlockId, publishedTypebot, totalAnswers, totalVisitedEdges]);

  const sourceTop = useMemo(() => {
    const blockTop = currentBlockId
      ? sourceEndpoints.get(currentBlockId)?.y
      : undefined;
    if (blockTop) return blockTop;
    const block = publishedTypebot?.groups
      .flatMap((group) => group.blocks)
      .find((block) => block.id === currentBlockId);
    if (!block || !blockHasItems(block)) return 0;
    const itemId = block.items.at(-1)?.id;
    if (!itemId) return 0;
    return sourceEndpoints.get(itemId)?.y;
  }, [currentBlockId, publishedTypebot?.groups, sourceEndpoints]);

  const endpointCoordinates = useMemo(() => {
    if (!groupId) return undefined;
    if (!groupCoordinates) return undefined;
    return computeSourceCoordinates({
      sourcePosition: groupCoordinates,
      sourceTop: sourceTop ?? 0,
      elementWidth: groupWidth,
    });
  }, [groupId, groupCoordinates, sourceTop]);

  const isLastBlock = useMemo(() => {
    if (!publishedTypebot) return false;
    const lastBlock = publishedTypebot.groups
      .find((group) =>
        group.blocks.some((block) => block.id === currentBlockId),
      )
      ?.blocks.at(-1);
    return lastBlock?.id === currentBlockId;
  }, [publishedTypebot, currentBlockId]);

  if (!endpointCoordinates || isNotDefined(dropOffRate)) return null;

  return (
    <>
      <path
        d={computeDropOffPath(
          {
            x: endpointCoordinates.x,
            y: endpointCoordinates.y,
          },
          isLastBlock,
        )}
        stroke={dropOffColor}
        strokeWidth={
          dropOffSegmentMinWidth * (1 - (dropOffRate ?? 0) / 100) +
          dropOffSegmentMaxWidth * ((dropOffRate ?? 0) / 100)
        }
        fill="none"
      />
      <foreignObject
        width={dropOffBoxDimensions.width}
        height={dropOffBoxDimensions.height}
        x={endpointCoordinates.x + dropOffStubLength}
        y={
          endpointCoordinates.y +
          (isLastBlock
            ? dropOffSegmentLength
            : -(dropOffBoxDimensions.height / 2))
        }
      >
        <Tooltip
          label={
            isWorkspaceProPlan
              ? `At this input, ${totalDroppedUser} user${
                  (totalDroppedUser ?? 2) > 1 ? "s" : ""
                } left. This represents ${dropOffRate}% of the users who saw this input.`
              : "Upgrade your plan to PRO to reveal drop-off rate."
          }
          placement="top"
        >
          <VStack
            bgColor={dropOffColor}
            color="white"
            rounded="md"
            p="2"
            justifyContent="center"
            w="full"
            h="full"
            onClick={isWorkspaceProPlan ? undefined : onUnlockProPlanClick}
            cursor={isWorkspaceProPlan ? "auto" : "pointer"}
            spacing={0.5}
          >
            <Text filter={isWorkspaceProPlan ? "" : "blur(2px)"} fontSize="sm">
              {isWorkspaceProPlan ? (
                dropOffRate
              ) : (
                <Text as="span" filter="blur(2px)">
                  X
                </Text>
              )}
              %
            </Text>
            <Tag colorScheme="red" size="sm">
              {isWorkspaceProPlan ? (
                totalDroppedUser
              ) : (
                <Text as="span" filter="blur(3px)" mr="1">
                  NN
                </Text>
              )}{" "}
              user{(totalDroppedUser ?? 2) > 1 ? "s" : ""}
            </Tag>
          </VStack>
        </Tooltip>
      </foreignObject>
    </>
  );
};
