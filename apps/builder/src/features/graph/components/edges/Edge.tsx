import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Portal, useColorMode, useDisclosure } from "@chakra-ui/react";
import type { Edge as EdgeProps } from "@typebot.io/typebot/schemas/edge";
import { colors } from "@typebot.io/ui/chakraTheme";
import type React from "react";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { eventWidth, groupWidth } from "../../constants";
import { computeEdgePath } from "../../helpers/computeEdgePath";
import { getAnchorsPosition } from "../../helpers/getAnchorsPosition";
import { useSelectionStore } from "../../hooks/useSelectionStore";
import { useEndpoints } from "../../providers/EndpointsProvider";
import { useGraph } from "../../providers/GraphProvider";
import { EdgeMenu } from "./EdgeMenu";

type Props = {
  edge: EdgeProps;
  fromElementId: string | undefined;
};

export const Edge = ({ edge, fromElementId }: Props) => {
  const isDark = useColorMode().colorMode === "dark";
  const { deleteEdge } = useTypebot();
  const { previewingEdge, graphPosition, isReadOnly, setPreviewingEdge } =
    useGraph();
  const { sourceEndpointYOffsets, targetEndpointYOffsets } = useEndpoints();
  const fromElementCoordinates = useSelectionStore(
    useShallow((state) =>
      fromElementId && state.elementsCoordinates
        ? state.elementsCoordinates[fromElementId]
        : undefined,
    ),
  );
  const toGroupCoordinates = useSelectionStore(
    useShallow((state) =>
      state.elementsCoordinates
        ? state.elementsCoordinates[edge.to.groupId]
        : undefined,
    ),
  );

  const [isMouseOver, setIsMouseOver] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [edgeMenuPosition, setEdgeMenuPosition] = useState({ x: 0, y: 0 });

  const isPreviewing = isMouseOver || previewingEdge?.id === edge.id;

  const sourceTop = useMemo(() => {
    const endpointId =
      "eventId" in edge.from
        ? edge.from.eventId
        : (edge?.from.pathId ?? edge?.from.itemId ?? edge?.from.blockId);
    if (!endpointId) return;
    return sourceEndpointYOffsets.get(endpointId)?.y;
  }, [edge.from, sourceEndpointYOffsets]);

  const targetTop = useMemo(() => {
    if (targetEndpointYOffsets.size === 0) return;
    if (edge.to.blockId) {
      const targetOffset = targetEndpointYOffsets.get(edge.to.blockId);
      if (!targetOffset) {
        // Something went wrong, the edge is connected to a block that doesn't exist anymore.
        deleteEdge(edge.id);
        return;
      }
      return targetOffset.y;
    }
    return;
  }, [deleteEdge, edge.id, edge.to.blockId, targetEndpointYOffsets]);

  const path = useMemo(() => {
    if (!fromElementCoordinates || !toGroupCoordinates || !sourceTop) return ``;
    const anchorsPosition = getAnchorsPosition({
      sourceGroupCoordinates: fromElementCoordinates,
      targetGroupCoordinates: toGroupCoordinates,
      elementWidth: "eventId" in edge.from ? eventWidth : groupWidth,
      sourceTop,
      targetTop,
      graphScale: graphPosition.scale,
    });
    return computeEdgePath(anchorsPosition);
  }, [
    fromElementCoordinates,
    toGroupCoordinates,
    sourceTop,
    edge.from,
    targetTop,
    graphPosition.scale,
  ]);

  const handleMouseEnter = () => setIsMouseOver(true);

  const handleMouseLeave = () => setIsMouseOver(false);

  const handleEdgeClick = () => {
    setPreviewingEdge(edge);
  };

  const handleContextMenuTrigger = (e: React.MouseEvent) => {
    if (isReadOnly) return;
    e.preventDefault();
    setEdgeMenuPosition({ x: e.clientX, y: e.clientY });
    onOpen();
  };

  const handleDeleteEdge = () => deleteEdge(edge.id);

  useKeyboardShortcuts({
    backspace: () => {
      if (isReadOnly || !isPreviewing) return;
      deleteEdge(edge.id);
    },
  });

  return (
    <>
      <path
        data-testid="clickable-edge"
        d={path}
        strokeWidth="18px"
        stroke="white"
        fill="none"
        pointerEvents="stroke"
        style={{ cursor: "pointer", visibility: "hidden" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleEdgeClick}
        onContextMenu={handleContextMenuTrigger}
      />
      <path
        data-testid="edge"
        d={path}
        stroke={
          isPreviewing
            ? "var(--chakra-colors-orange-400)"
            : isDark
              ? colors.gray[700]
              : colors.gray[400]
        }
        strokeWidth="2px"
        markerEnd={isPreviewing ? "url(#orange-arrow)" : "url(#arrow)"}
        fill="none"
        pointerEvents="none"
      />
      <Portal>
        <EdgeMenu
          isOpen={isOpen}
          position={edgeMenuPosition}
          onDeleteEdge={handleDeleteEdge}
          onClose={onClose}
        />
      </Portal>
    </>
  );
};
