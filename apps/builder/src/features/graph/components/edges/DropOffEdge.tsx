import { blockHasItems } from "@typebot.io/blocks-core/helpers";
import { byId, isNotDefined } from "@typebot.io/lib/utils";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Tooltip } from "@typebot.io/ui/components/Tooltip";
import { cx } from "@typebot.io/ui/lib/cva";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { computeTotalUsersAtBlock } from "@/features/analytics/helpers/computeTotalUsersAtBlock";
import { getTotalAnswersAtBlock } from "@/features/analytics/helpers/getTotalAnswersAtBlock";
import type {
  EdgeWithTotalVisits,
  TotalAnswers,
} from "@/features/analytics/schemas";
import { hasProPerks } from "@/features/billing/helpers/hasProPerks";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { groupWidth } from "../../constants";
import { computeDropOffPath } from "../../helpers/computeDropOffPath";
import { computeSourceCoordinates } from "../../helpers/computeSourceCoordinates";
import { useSelectionStore } from "../../hooks/useSelectionStore";
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
  edgesWithTotalUsers: EdgeWithTotalVisits[];
  totalAnswers: TotalAnswers[];
  onUnlockProPlanClick?: () => void;
};

export const DropOffEdge = ({
  edgesWithTotalUsers,
  totalAnswers,
  blockId,
  onUnlockProPlanClick,
}: Props) => {
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
  const groupCoordinates = useSelectionStore(
    useShallow((state) =>
      groupId && state.elementsCoordinates
        ? state.elementsCoordinates[groupId]
        : undefined,
    ),
  );
  const { sourceEndpointYOffsets: sourceEndpoints } = useEndpoints();

  const isWorkspaceProPlan = hasProPerks(workspace);

  const { totalDroppedUser, dropOffRate, totalUsersAtBlock } = useMemo(() => {
    if (!publishedTypebot || !currentBlockId) return {};
    const totalUsersAtBlock = computeTotalUsersAtBlock(currentBlockId, {
      publishedTypebot,
      edgesWithTotalUsers,
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
      totalUsersAtBlock,
    };
  }, [currentBlockId, publishedTypebot, totalAnswers, edgesWithTotalUsers]);

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
    if (!groupId) return;
    if (!groupCoordinates) return;
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
        className="stroke-red-9"
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
        <Tooltip.Root>
          <Tooltip.Trigger
            render={
              isWorkspaceProPlan ? (
                <div
                  className="flex flex-col items-center rounded-md p-2 justify-center w-full h-full gap-0.5 bg-red-9 text-white"
                  data-testid={`dropoff-edge-${blockId}`}
                >
                  <span className="text-sm">{dropOffRate}%</span>
                  <Badge colorScheme="red">
                    {totalDroppedUser} user
                    {(totalDroppedUser ?? 2) > 1 ? "s" : ""}
                  </Badge>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex flex-col items-center rounded-md p-2 justify-center w-full h-full gap-0.5 bg-red-9 text-white cursor-pointer"
                  data-testid={`dropoff-edge-${blockId}`}
                  onClick={onUnlockProPlanClick}
                >
                  <span className={cx("text-sm", "blur-[2px]")}>
                    <span className="blur-[2px]">X</span>%
                  </span>
                  <Badge colorScheme="red">
                    <span className="mr-1 blur-[3px]">NN</span> user
                    {(totalDroppedUser ?? 2) > 1 ? "s" : ""}
                  </Badge>
                </button>
              )
            }
          />
          <Tooltip.Popup>
            {isWorkspaceProPlan ? (
              <>
                <p>👀 Displayed {totalUsersAtBlock} times.</p>
                <p>
                  {totalDroppedUser === 0 ? null : (
                    <>
                      🚶 {totalDroppedUser} user
                      {(totalDroppedUser ?? 0) > 1 ? "s" : ""} left.
                    </>
                  )}
                </p>
                <p>💥 Drop-off rate: {dropOffRate}%</p>
              </>
            ) : (
              "Upgrade your plan to PRO to reveal drop-off rate."
            )}
          </Tooltip.Popup>
        </Tooltip.Root>
      </foreignObject>
    </>
  );
};
