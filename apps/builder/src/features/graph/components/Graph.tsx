import type {
  EdgeWithTotalVisits,
  TotalAnswers,
} from "@/features/analytics/schemas";
import { headerHeight } from "@/features/editor/constants";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useUser } from "@/features/user/hooks/useUser";
import {
  Box,
  Fade,
  Flex,
  type FlexProps,
  Portal,
  useEventListener,
} from "@chakra-ui/react";
import { createId } from "@paralleldrive/cuid2";
import { shouldOpenBlockSettingsOnCreation } from "@typebot.io/blocks-core/helpers";
import type { BlockV6 } from "@typebot.io/blocks-core/schemas/schema";
import { GraphNavigation } from "@typebot.io/prisma/enum";
import type { PublicTypebotV6 } from "@typebot.io/typebot/schemas/publicTypebot";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { useGesture } from "@use-gesture/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { useShallow } from "zustand/react/shallow";
import { graphPositionDefaultValue } from "../constants";
import { computeSelectBoxDimensions } from "../helpers/computeSelectBoxDimensions";
import { isSelectBoxIntersectingWithElement } from "../helpers/isSelectBoxIntersectingWithElement";
import { projectMouse } from "../helpers/projectMouse";
import { useSelectionStore } from "../hooks/useSelectionStore";
import { useBlockDnd } from "../providers/GraphDndProvider";
import { useGraph } from "../providers/GraphProvider";
import type { Coordinates } from "../types";
import { ElementsSelectionMenu } from "./ElementsSelectionMenu";
import GraphElements from "./GraphElements";
import { SelectBox } from "./SelectBox";
import { ZoomButtons } from "./ZoomButtons";

const maxScale = 2;
const minScale = 0.2;
const zoomButtonsScaleBlock = 0.2;

export const Graph = ({
  typebot,
  totalAnswers,
  edgesWithTotalUsers,
  onUnlockProPlanClick,
  ...props
}: {
  typebot: TypebotV6 | PublicTypebotV6;
  edgesWithTotalUsers?: EdgeWithTotalVisits[];
  totalAnswers?: TotalAnswers[];
  onUnlockProPlanClick?: () => void;
} & FlexProps) => {
  const {
    draggedBlockType,
    setDraggedBlockType,
    draggedEventType,
    setDraggedEventType,
    draggedBlock,
    setDraggedBlock,
    draggedItem,
    setDraggedItem,
  } = useBlockDnd();
  const { createGroup, createEvent } = useTypebot();
  const { user } = useUser();
  const {
    isReadOnly,
    setGraphPosition: setGlobalGraphPosition,
    setOpenedNodeId,
    setPreviewingEdge,
    connectingIds,
  } = useGraph();
  const isDraggingGraph = useSelectionStore((state) => state.isDraggingGraph);
  const setIsDraggingGraph = useSelectionStore(
    (state) => state.setIsDraggingGraph,
  );
  const focusedElementsId = useSelectionStore(
    useShallow((state) => state.focusedElementsId),
  );
  const {
    setElementsCoordinates,
    blurElements,
    setFocusedElements,
    updateElementCoordinates,
  } = useSelectionStore(
    useShallow((state) => ({
      updateElementCoordinates: state.updateElementCoordinates,
      setElementsCoordinates: state.setElementsCoordinates,
      blurElements: state.blurElements,
      setFocusedElements: state.setFocusedElements,
    })),
  );

  const [graphPosition, setGraphPosition] = useState(
    graphPositionDefaultValue(
      typebot.events[0].graphCoordinates ?? { x: 0, y: 0 },
    ),
  );
  const [autoMoveDirection, setAutoMoveDirection] = useState<
    "top" | "right" | "bottom" | "left" | undefined
  >();
  const [selectBoxCoordinates, setSelectBoxCoordinates] = useState<
    | {
        origin: Coordinates;
        dimension: {
          width: number;
          height: number;
        };
      }
    | undefined
  >();
  const [elementRects, setElementRects] = useState<
    { elementId: string; rect: DOMRect }[] | undefined
  >();
  const [isDragging, setIsDragging] = useState(false);

  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  useAutoMoveBoard(autoMoveDirection, setGraphPosition);

  const [debouncedGraphPosition] = useDebounce(graphPosition, 200);
  const transform = useMemo(
    () =>
      `translate(${Number(graphPosition.x.toFixed(2))}px, ${Number(
        graphPosition.y.toFixed(2),
      )}px) scale(${graphPosition.scale})`,
    [graphPosition],
  );

  useEffect(() => {
    editorContainerRef.current = document.getElementById(
      "editor-container",
    ) as HTMLDivElement;
  }, []);

  useEffect(() => {
    if (!graphContainerRef.current) return;
    const { top, left } = graphContainerRef.current.getBoundingClientRect();
    setGlobalGraphPosition({
      x: left + debouncedGraphPosition.x,
      y: top + debouncedGraphPosition.y,
      scale: debouncedGraphPosition.scale,
    });
  }, [debouncedGraphPosition, setGlobalGraphPosition]);

  useEffect(() => {
    setElementsCoordinates({
      groups: typebot.groups,
      events: typebot.events,
    });
  }, []);

  const handleMouseUp = (e: MouseEvent) => {
    if (!typebot) return;
    if (draggedItem) setDraggedItem(undefined);
    if (!draggedBlock && !draggedBlockType && !draggedEventType) return;
    const coordinates = projectMouse(
      { x: e.clientX, y: e.clientY },
      graphPosition,
    );
    const id = createId();
    updateElementCoordinates(id, coordinates);
    if (draggedEventType) {
      createEvent({
        id,
        type: draggedEventType,
        graphCoordinates: coordinates,
      });
      setDraggedEventType(undefined);
      setOpenedNodeId(id);
    } else {
      const newBlockId = createGroup({
        id,
        ...coordinates,
        block: draggedBlock ?? (draggedBlockType as BlockV6["type"]),
        indices: { groupIndex: typebot.groups.length, blockIndex: 0 },
      });
      setDraggedBlock(undefined);
      setDraggedBlockType(undefined);
      if (newBlockId && shouldOpenBlockSettingsOnCreation(draggedBlockType)) {
        setOpenedNodeId(newBlockId);
      }
    }
  };

  const handleCaptureMouseDown = (e: MouseEvent) => {
    const isRightClick = e.button === 2;
    if (isRightClick) e.stopPropagation();
  };

  const handlePointerUp = (e: MouseEvent) => {
    if (isDraggingGraph || e.button === 2) return;
    if (
      !selectBoxCoordinates ||
      Math.abs(selectBoxCoordinates?.dimension.width) +
        Math.abs(selectBoxCoordinates?.dimension.height) <
        5
    ) {
      blurElements();
    }
    setSelectBoxCoordinates(undefined);
    setOpenedNodeId(undefined);
    setPreviewingEdge(undefined);
  };

  useGesture(
    {
      onDrag: (props) => {
        if (
          isDraggingGraph ||
          (user?.graphNavigation !== GraphNavigation.TRACKPAD &&
            !props.shiftKey)
        ) {
          if (props.first) setIsDragging(true);
          if (props.last) setIsDragging(false);
          setGraphPosition({
            ...graphPosition,
            x: graphPosition.x + props.delta[0],
            y: graphPosition.y + props.delta[1],
          });
          return;
        }
        if (isReadOnly) return;
        const currentElementRects = props.first
          ? Array.from(document.querySelectorAll("[data-selectable]")).map(
              (element) => {
                return {
                  elementId: (element as HTMLDivElement).dataset.selectable!,
                  rect: element.getBoundingClientRect(),
                };
              },
            )
          : elementRects;
        if (props.first) setElementRects(currentElementRects);
        const dimensions = computeSelectBoxDimensions(props);
        setSelectBoxCoordinates(dimensions);
        const selectedElements = currentElementRects!.reduce<string[]>(
          (acc, element) => {
            if (isSelectBoxIntersectingWithElement(dimensions, element.rect)) {
              return [...acc, element.elementId];
            }
            return acc;
          },
          [],
        );
        if (selectedElements.length > 0) setFocusedElements(selectedElements);
      },
      onWheel: ({ shiftKey, delta: [dx, dy], pinching }) => {
        if (pinching) return;

        setGraphPosition({
          ...graphPosition,
          x: shiftKey ? graphPosition.x - dy : graphPosition.x - dx,
          y: shiftKey ? graphPosition.y : graphPosition.y - dy,
        });
      },
      onPinch: ({ origin: [x, y], offset: [scale] }) => {
        zoom({ scale, mousePosition: { x, y } });
      },
    },
    {
      target: graphContainerRef,
      pinch: {
        scaleBounds: { min: minScale, max: maxScale },
        modifierKey: "ctrlKey",
      },
      drag: { pointer: { keys: false } },
    },
  );

  // Prevent back/forward navigation in Firefox
  useEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
    },
    graphContainerRef.current,
    {
      passive: false,
    },
  );

  const getCenterOfGraph = (): Coordinates => {
    const graphWidth = graphContainerRef.current?.clientWidth ?? 0;
    const graphHeight = graphContainerRef.current?.clientHeight ?? 0;
    return {
      x: graphWidth / 2,
      y: graphHeight / 2,
    };
  };

  const zoom = ({
    scale,
    mousePosition,
    delta,
  }: {
    scale?: number;
    delta?: number;
    mousePosition?: Coordinates;
  }) => {
    const { x: mouseX, y } = mousePosition ?? getCenterOfGraph();
    const mouseY = y - headerHeight;
    let newScale = graphPosition.scale + (delta ?? 0);
    if (scale) {
      const scaleDiff = scale - graphPosition.scale;
      newScale +=
        Math.min(zoomButtonsScaleBlock, Math.abs(scaleDiff)) *
        Math.sign(scaleDiff);
    }

    if (
      (newScale >= maxScale && graphPosition.scale === maxScale) ||
      (newScale <= minScale && graphPosition.scale === minScale)
    )
      return;
    newScale =
      newScale >= maxScale
        ? maxScale
        : newScale <= minScale
          ? minScale
          : newScale;

    const xs = (mouseX - graphPosition.x) / graphPosition.scale;
    const ys = (mouseY - graphPosition.y) / graphPosition.scale;
    setGraphPosition({
      ...graphPosition,
      x: mouseX - xs * newScale,
      y: mouseY - ys * newScale,
      scale: newScale,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!connectingIds)
      return autoMoveDirection ? setAutoMoveDirection(undefined) : undefined;
    if (e.clientX <= 50) return setAutoMoveDirection("left");
    if (e.clientY <= 50 + headerHeight) return setAutoMoveDirection("top");
    if (e.clientX >= window.innerWidth - 50)
      return setAutoMoveDirection("right");
    if (e.clientY >= window.innerHeight - 50)
      return setAutoMoveDirection("bottom");
    setAutoMoveDirection(undefined);
  };

  useEventListener("keydown", (e) => {
    if (e.key === " " && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey)
      setIsDraggingGraph(true);
  });
  useEventListener("keyup", (e) => {
    if (e.key === " ") {
      setIsDraggingGraph(false);
      setIsDragging(false);
    }
  });

  useEventListener(
    "blur",
    () => {
      setIsDraggingGraph(false);
      setIsDragging(false);
    },
    window as any,
  );

  useEventListener("mousedown", handleCaptureMouseDown, undefined, {
    capture: true,
  });
  useEventListener("mouseup", handleMouseUp, graphContainerRef.current);
  useEventListener("pointerup", handlePointerUp, editorContainerRef.current);
  useEventListener("mousemove", handleMouseMove);

  // Make sure pinch doesn't interfere with native Safari zoom
  // More info: https://use-gesture.netlify.app/docs/gestures/
  useEventListener("gesturestart", (e) => e.preventDefault());
  useEventListener("gesturechange", (e) => e.preventDefault());

  const zoomIn = () => zoom({ delta: zoomButtonsScaleBlock });
  const zoomOut = () => zoom({ delta: -zoomButtonsScaleBlock });

  const cursor = isDraggingGraph ? (isDragging ? "grabbing" : "grab") : "auto";

  return (
    <Flex
      ref={graphContainerRef}
      style={{
        touchAction: "none",
        cursor,
      }}
      {...props}
    >
      <Flex
        flex="1"
        w="full"
        h="full"
        position="absolute"
        data-testid="graph"
        style={{
          transform,
          perspective: 1000,
          backfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
        }}
        willChange="transform"
        transformOrigin="0px 0px 0px"
      >
        <GraphElements
          edges={typebot.edges}
          groups={typebot.groups}
          events={typebot.events}
          totalAnswers={totalAnswers}
          edgesWithTotalUsers={edgesWithTotalUsers}
          onUnlockProPlanClick={onUnlockProPlanClick}
        />
      </Flex>
      {!isReadOnly && (
        <Portal>
          {selectBoxCoordinates && <SelectBox {...selectBoxCoordinates} />}
          <Fade in={!isReadOnly && focusedElementsId.length > 1}>
            <Box
              pos="absolute"
              top={`calc(${headerHeight}px + 20px)`}
              right="140px"
            >
              <ElementsSelectionMenu
                graphPosition={graphPosition}
                focusedElementIds={focusedElementsId}
                blurElements={blurElements}
                isReadOnly={isReadOnly}
              />
            </Box>
          </Fade>
        </Portal>
      )}
      <Box pos="absolute" top="70px" right="40px">
        <ZoomButtons onZoomInClick={zoomIn} onZoomOutClick={zoomOut} />
      </Box>
    </Flex>
  );
};

const useAutoMoveBoard = (
  autoMoveDirection: "top" | "right" | "bottom" | "left" | undefined,
  setGraphPosition: React.Dispatch<
    React.SetStateAction<{
      x: number;
      y: number;
      scale: number;
    }>
  >,
) =>
  useEffect(() => {
    if (!autoMoveDirection) return;
    const interval = setInterval(() => {
      setGraphPosition((prev) => ({
        ...prev,
        x:
          autoMoveDirection === "right"
            ? prev.x - 5
            : autoMoveDirection === "left"
              ? prev.x + 5
              : prev.x,
        y:
          autoMoveDirection === "bottom"
            ? prev.y - 5
            : autoMoveDirection === "top"
              ? prev.y + 5
              : prev.y,
      }));
    }, 5);

    return () => {
      clearInterval(interval);
    };
  }, [autoMoveDirection, setGraphPosition]);
