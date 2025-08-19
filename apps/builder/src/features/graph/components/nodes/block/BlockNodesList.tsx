import { Portal } from "@/components/Portal";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  computeNearestPlaceholderIndex,
  useBlockDnd,
} from "@/features/graph/providers/GraphDndProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { Stack } from "@chakra-ui/react";
import type { Coordinates } from "@dnd-kit/utilities";
import { shouldOpenBlockSettingsOnCreation } from "@typebot.io/blocks-core/helpers";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { isDefined } from "@typebot.io/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { PlaceholderNode } from "../PlaceholderNode";
import { BlockNode } from "./BlockNode";
import { BlockNodeOverlay } from "./BlockNodeOverlay";

type Props = {
  blocks: BlockV6[];
  groupIndex: number;
  groupRef: React.MutableRefObject<HTMLDivElement | null>;
};
export const BlockNodesList = ({ blocks, groupIndex, groupRef }: Props) => {
  const {
    draggedBlock,
    setDraggedBlock,
    draggedBlockType,
    mouseOverGroup,
    setDraggedBlockType,
  } = useBlockDnd();
  const { typebot, createBlock, detachBlockFromGroup } = useTypebot();
  const { isReadOnly, graphPosition, setOpenedNodeId } = useGraph();
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<
    number | undefined
  >();
  const placeholderRefs = useRef<HTMLDivElement[]>([]);
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [mousePositionInElement, setMousePositionInElement] = useState({
    x: 0,
    y: 0,
  });
  const groupId = typebot?.groups.at(groupIndex)?.id;
  const isDraggingOnCurrentGroup =
    (draggedBlock || draggedBlockType) && mouseOverGroup?.id === groupId;
  const showSortPlaceholders = isDefined(draggedBlock || draggedBlockType);

  useEffect(() => {
    if (mouseOverGroup?.id !== groupId) setExpandedPlaceholderIndex(undefined);
  }, [groupId, mouseOverGroup?.id]);

  const handleBlockMouseDown =
    (blockIndex: number) =>
    (
      { relative, absolute }: { absolute: Coordinates; relative: Coordinates },
      block: BlockV6,
    ) => {
      if (isReadOnly || !groupId) return;
      placeholderRefs.current.splice(blockIndex + 1, 1);
      setMousePositionInElement(relative);
      setPosition({
        x: absolute.x - relative.x,
        y: absolute.y - relative.y,
      });
      setDraggedBlock({ ...block, groupId });
      detachBlockFromGroup({ groupIndex, blockIndex });
    };

  const handlePushElementRef =
    (idx: number) => (elem: HTMLDivElement | null) => {
      elem && (placeholderRefs.current[idx] = elem);
    };

  const onGroupMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDraggingOnCurrentGroup) return;
      setExpandedPlaceholderIndex(
        computeNearestPlaceholderIndex(event.pageY, placeholderRefs),
      );
    },
    [isDraggingOnCurrentGroup],
  );
  useEffect(() => {
    groupRef.current?.addEventListener("mousemove", onGroupMouseMove);
    return () => {
      groupRef.current?.removeEventListener("mousemove", onGroupMouseMove);
    };
  }, [onGroupMouseMove]);

  const onGlobalMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!draggedBlock?.groupId || draggedBlock.groupId !== groupId) return;
      const { clientX, clientY } = event;
      setPosition({
        x: clientX - mousePositionInElement.x,
        y: clientY - mousePositionInElement.y,
      });
    },
    [
      draggedBlock?.groupId,
      groupId,
      mousePositionInElement.x,
      mousePositionInElement.y,
    ],
  );
  useEffect(() => {
    window.addEventListener("mousemove", onGlobalMouseMove);
    return () => {
      window.removeEventListener("mousemove", onGlobalMouseMove);
    };
  }, [onGlobalMouseMove]);

  const onGroupMouseUp = useCallback(
    (e: MouseEvent) => {
      setExpandedPlaceholderIndex(undefined);
      if (!isDraggingOnCurrentGroup || !groupId) return;
      const blockIndex = computeNearestPlaceholderIndex(
        e.clientY,
        placeholderRefs,
      );
      const blockId = createBlock(
        (draggedBlock || draggedBlockType) as BlockV6 | BlockV6["type"],
        {
          groupIndex,
          blockIndex,
        },
      );
      setDraggedBlock(undefined);
      setDraggedBlockType(undefined);
      if (shouldOpenBlockSettingsOnCreation(draggedBlockType))
        setOpenedNodeId(blockId);
    },
    [
      isDraggingOnCurrentGroup,
      groupId,
      draggedBlock,
      draggedBlockType,
      groupIndex,
    ],
  );
  useEffect(() => {
    groupRef.current?.addEventListener("mouseup", onGroupMouseUp, {
      capture: true,
    });
    return () => {
      groupRef.current?.removeEventListener("mouseup", onGroupMouseUp, {
        capture: true,
      });
    };
  }, [onGroupMouseUp]);

  return (
    <Stack spacing={0} transition="none">
      <PlaceholderNode
        isVisible={showSortPlaceholders}
        isExpanded={expandedPlaceholderIndex === 0}
        ref={handlePushElementRef(0)}
        expandedHeightPixels={50}
        expandedPaddingPixel={8}
        initialPaddingPixel={2}
        initialHeightPixels={4}
      />
      {typebot &&
        blocks.map((block, idx) => (
          <Stack key={block.id} spacing={0}>
            <BlockNode
              key={block.id}
              block={block}
              indices={{ groupIndex, blockIndex: idx }}
              isConnectable={blocks.length - 1 === idx}
              onMouseDown={handleBlockMouseDown(idx)}
            />
            <PlaceholderNode
              isVisible={showSortPlaceholders}
              isExpanded={expandedPlaceholderIndex === idx + 1}
              ref={handlePushElementRef(idx + 1)}
              expandedHeightPixels={50}
              expandedPaddingPixel={8}
              initialPaddingPixel={2}
              initialHeightPixels={4}
            />
          </Stack>
        ))}
      {draggedBlock && draggedBlock.groupId === groupId && (
        <Portal>
          <BlockNodeOverlay
            block={draggedBlock}
            indices={{ groupIndex, blockIndex: 0 }}
            pos="fixed"
            top="0"
            left="0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg) scale(${graphPosition.scale})`,
            }}
            transformOrigin="0 0 0"
          />
        </Portal>
      )}
    </Stack>
  );
};
