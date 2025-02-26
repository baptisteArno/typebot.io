import assert from "assert";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useUser } from "@/features/user/hooks/useUser";
import { trpcVanilla } from "@/lib/trpc";
import { useEventListener } from "@chakra-ui/react";
import type { Coordinates } from "@dnd-kit/utilities";
import { omit } from "@typebot.io/lib/utils";
import { colors } from "@typebot.io/ui/chakraTheme";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { eventWidth, groupWidth } from "../../constants";
import { computeConnectingEdgePath } from "../../helpers/computeConnectingEdgePath";
import { computeEdgePathToMouse } from "../../helpers/computeEdgePathToMouth";
import { useSelectionStore } from "../../hooks/useSelectionStore";
import { useEndpoints } from "../../providers/EndpointsProvider";
import { useGraph } from "../../providers/GraphProvider";
import type { ConnectingIds } from "../../types";

type Props = {
  connectingIds: ConnectingIds;
};

export const DrawingEdge = ({ connectingIds }: Props) => {
  const { graphPosition, setConnectingIds } = useGraph();
  const {
    sourceEndpointYOffsets: sourceEndpoints,
    targetEndpointYOffsets: targetEndpoints,
  } = useEndpoints();
  const elementsCoordinates = useSelectionStore(
    (state) => state.elementsCoordinates,
    // Keep in cache because groups are not changing while drawing an edge
    () => true,
  );
  const { user } = useUser();
  const { createEdge, typebot, updateGroup } = useTypebot();
  const [mousePosition, setMousePosition] = useState<Coordinates | null>(null);

  const sourceElementCoordinates = connectingIds
    ? "eventId" in connectingIds.source
      ? elementsCoordinates?.[connectingIds?.source.eventId]
      : elementsCoordinates?.[connectingIds?.source.groupId ?? ""]
    : undefined;

  const targetGroupCoordinates =
    elementsCoordinates &&
    elementsCoordinates[connectingIds?.target?.groupId ?? ""];

  const sourceTop = useMemo(() => {
    if (!connectingIds) return 0;
    const endpointId =
      "eventId" in connectingIds.source
        ? connectingIds.source.eventId
        : (connectingIds.source.itemId ?? connectingIds.source.blockId);
    return sourceEndpoints.get(endpointId)?.y;
  }, [connectingIds, sourceEndpoints]);

  const targetTop = useMemo(() => {
    if (!connectingIds) return 0;
    const endpointId = connectingIds.target?.blockId;
    return endpointId ? targetEndpoints.get(endpointId)?.y : undefined;
  }, [connectingIds, targetEndpoints]);

  const path = useMemo(() => {
    if (
      !sourceTop ||
      !sourceElementCoordinates ||
      !mousePosition ||
      !connectingIds?.source
    )
      return ``;

    return targetGroupCoordinates
      ? computeConnectingEdgePath({
          sourceGroupCoordinates: sourceElementCoordinates,
          targetGroupCoordinates,
          elementWidth:
            "eventId" in connectingIds.source ? eventWidth : groupWidth,
          sourceTop,
          targetTop,
          graphScale: graphPosition.scale,
        })
      : computeEdgePathToMouse({
          sourceGroupCoordinates: sourceElementCoordinates,
          mousePosition,
          sourceTop,
          elementWidth:
            "eventId" in connectingIds.source ? eventWidth : groupWidth,
        });
  }, [
    sourceTop,
    sourceElementCoordinates,
    mousePosition,
    targetGroupCoordinates,
    connectingIds?.source,
    targetTop,
    graphPosition.scale,
  ]);

  const handleMouseMove = (e: MouseEvent) => {
    if (!connectingIds) {
      if (mousePosition) setMousePosition(null);
      return;
    }
    const coordinates = {
      x: (e.clientX - graphPosition.x) / graphPosition.scale,
      y: (e.clientY - graphPosition.y) / graphPosition.scale,
    };
    setMousePosition(coordinates);
  };
  useEventListener("mousemove", handleMouseMove);
  useEventListener("mouseup", () => {
    if (connectingIds?.target) createNewEdge(connectingIds);
    setConnectingIds(null);
  });

  const createNewEdge = async (connectingIds: ConnectingIds) => {
    assert(connectingIds.target);
    createEdge({
      from:
        "groupId" in connectingIds.source
          ? omit(connectingIds.source, "groupId")
          : connectingIds.source,
      to: connectingIds.target,
    });
    const groupTitlesAutoGeneration = user?.groupTitlesAutoGeneration;
    if (
      typebot &&
      groupTitlesAutoGeneration?.isEnabled &&
      groupTitlesAutoGeneration.credentialsId &&
      groupTitlesAutoGeneration.provider &&
      groupTitlesAutoGeneration.model &&
      "groupId" in connectingIds.source
    ) {
      const groupIndex = typebot?.groups.findIndex(
        (g) => g.id === (connectingIds.source as { groupId: string }).groupId,
      );
      const group = typebot.groups[groupIndex];
      if (!group || !group?.title.startsWith("Group #")) return;
      try {
        const result = await trpcVanilla.generateGroupTitle.mutate({
          credentialsId: groupTitlesAutoGeneration.credentialsId,
          typebotId: typebot.id,
          groupContent: JSON.stringify({
            blocks: group.blocks.map(({ id, outgoingEdgeId, ...rest }) => rest),
          }),
          model: groupTitlesAutoGeneration.model,
          prompt: groupTitlesAutoGeneration.prompt,
        });

        updateGroup(groupIndex, { title: result.title });
      } catch (error) {
        toast.error("Failed to auto generate group title");
        console.error("Failed to generate group title:", error);
      }
    }
  };

  if (mousePosition && mousePosition.x === 0 && mousePosition.y === 0)
    return <></>;
  return (
    <path
      d={path}
      stroke={colors.orange[400]}
      strokeWidth="2px"
      markerEnd="url(#orange-arrow)"
      fill="none"
    />
  );
};
