import type { ItemV6 } from "@typebot.io/blocks-core/schemas/items/schema";
import type {
  BlockV6,
  BlockWithItems,
} from "@typebot.io/blocks-core/schemas/schema";
import type { AbTestBlock } from "@typebot.io/blocks-logic/abTest/schema";
import type { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { TDraggableEvent } from "@typebot.io/events/schemas";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Coordinates } from "../types";

type NodeElement = {
  id: string;
  element: HTMLDivElement;
};

export type BlockWithCreatableItems = Exclude<
  BlockWithItems,
  { type: LogicBlockType.AB_TEST }
>;

export type DraggableItem = Exclude<ItemV6, AbTestBlock["items"][number]> & {
  type: BlockWithCreatableItems["type"];
  blockId: string;
};

const graphDndContext = createContext<{
  draggedBlockType?: BlockV6["type"];
  setDraggedBlockType: Dispatch<SetStateAction<BlockV6["type"] | undefined>>;
  draggedBlock?: BlockV6 & { groupId: string };
  setDraggedBlock: Dispatch<
    SetStateAction<(BlockV6 & { groupId: string }) | undefined>
  >;
  draggedItem?: DraggableItem;
  setDraggedItem: Dispatch<SetStateAction<DraggableItem | undefined>>;
  mouseOverGroup?: NodeElement;
  setMouseOverGroup: (node: NodeElement | undefined) => void;
  mouseOverBlock?: NodeElement;
  setMouseOverBlock: (node: NodeElement | undefined) => void;
  draggedEventType?: TDraggableEvent["type"];
  setDraggedEventType: Dispatch<
    SetStateAction<TDraggableEvent["type"] | undefined>
  >;
  //@ts-ignore
}>({});

export type NodePosition = { absolute: Coordinates; relative: Coordinates };

export const GraphDndProvider = ({ children }: { children: ReactNode }) => {
  const [draggedBlock, setDraggedBlock] = useState<
    BlockV6 & { groupId: string }
  >();
  const [draggedBlockType, setDraggedBlockType] = useState<
    BlockV6["type"] | undefined
  >();
  const [draggedItem, setDraggedItem] = useState<DraggableItem | undefined>();
  const [draggedEventType, setDraggedEventType] = useState<
    TDraggableEvent["type"] | undefined
  >();
  const [mouseOverGroup, setMouseOverGroup] = useState<NodeElement>();
  const [mouseOverBlock, setMouseOverBlock] = useState<NodeElement>();

  return (
    <graphDndContext.Provider
      value={{
        draggedBlock,
        setDraggedBlock,
        draggedBlockType,
        setDraggedBlockType,
        draggedItem,
        setDraggedItem,
        mouseOverGroup,
        setMouseOverGroup,
        mouseOverBlock,
        setMouseOverBlock,
        draggedEventType,
        setDraggedEventType,
      }}
    >
      {children}
    </graphDndContext.Provider>
  );
};

export const useDragDistance = ({
  ref,
  onDrag,
  distanceTolerance = 20,
  isDisabled = false,
  deps = [],
}: {
  ref: React.MutableRefObject<HTMLDivElement | null>;
  onDrag: (position: { absolute: Coordinates; relative: Coordinates }) => void;
  distanceTolerance?: number;
  isDisabled?: boolean;
  deps?: unknown[];
}) => {
  const mouseDownPosition = useRef<{
    absolute: Coordinates;
    relative: Coordinates;
  }>();

  const onGlobalMouseUp = useCallback(() => {
    if (mouseDownPosition.current) mouseDownPosition.current = undefined;
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", onGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", onGlobalMouseUp);
    };
  }, [onGlobalMouseUp]);

  useEffect(() => {
    const onCurrentElementMouseDown = (e: MouseEvent) => {
      if (isDisabled || !ref.current) return;
      e.stopPropagation();
      const { top, left } = ref.current.getBoundingClientRect();
      mouseDownPosition.current = {
        absolute: { x: e.clientX, y: e.clientY },
        relative: {
          x: e.clientX - left,
          y: e.clientY - top,
        },
      };
    };

    ref.current?.addEventListener("mousedown", onCurrentElementMouseDown);

    return () => {
      ref.current?.removeEventListener("mousedown", onCurrentElementMouseDown);
    };
  }, [isDisabled, ...deps]);

  useEffect(() => {
    let triggered = false;
    const triggerDragCallbackIfMouseMovedEnough = (e: MouseEvent) => {
      if (!mouseDownPosition.current || triggered) return;
      const { clientX, clientY } = e;
      if (
        Math.abs(mouseDownPosition.current.absolute.x - clientX) >
          distanceTolerance ||
        Math.abs(mouseDownPosition.current.absolute.y - clientY) >
          distanceTolerance
      ) {
        triggered = true;
        onDrag(mouseDownPosition.current);
      }
    };

    document.addEventListener(
      "mousemove",
      triggerDragCallbackIfMouseMovedEnough,
    );

    return () => {
      document.removeEventListener(
        "mousemove",
        triggerDragCallbackIfMouseMovedEnough,
      );
    };
  }, [distanceTolerance, onDrag]);
};

export const computeNearestPlaceholderIndex = (
  offsetY: number,
  placeholderRefs: React.MutableRefObject<HTMLDivElement[]>,
) => {
  const { closestIndex } = placeholderRefs.current.reduce(
    (prev, elem, index) => {
      const elementTop = elem.getBoundingClientRect().top;
      const mouseDistanceFromPlaceholder = Math.abs(offsetY - elementTop);
      return mouseDistanceFromPlaceholder < prev.value
        ? { closestIndex: index, value: mouseDistanceFromPlaceholder }
        : prev;
    },
    { closestIndex: 0, value: 999999999999 },
  );
  return closestIndex;
};

export const useBlockDnd = () => useContext(graphDndContext);
