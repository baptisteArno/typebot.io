import type { GroupV6 } from "@typebot.io/groups/schemas";
import { isEmpty, isNotDefined } from "@typebot.io/lib/utils";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { cx } from "@typebot.io/ui/lib/cva";
import { useDrag } from "@use-gesture/react";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { SingleLineEditable } from "@/components/SingleLineEditable";
import { useEditor } from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { groupWidth } from "@/features/graph/constants";
import { useSelectionStore } from "@/features/graph/hooks/useSelectionStore";
import { useBlockDnd } from "@/features/graph/providers/GraphDndProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { useRightPanel } from "@/hooks/useRightPanel";
import { BlockNodesList } from "../block/BlockNodesList";
import { GroupFocusToolbar } from "./GroupFocusToolbar";
import { GroupNodeContextMenuPopup } from "./GroupNodeContextMenuPopup";

type Props = {
  group: GroupV6;
  groupIndex: number;
};

export const GroupNode = ({ group, groupIndex }: Props) => {
  const {
    connectingIds,
    setConnectingIds,
    previewingEdge,
    previewingBlock,
    isReadOnly,
    graphPosition,
  } = useGraph();
  const { typebot, updateGroup, updateGroupsCoordinates } = useTypebot();
  const { setMouseOverGroup, mouseOverGroup } = useBlockDnd();
  const { setStartPreviewFrom } = useEditor();
  const [, setRightPanel] = useRightPanel();

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [groupTitle, setGroupTitle] = useState(group.title);
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);

  const isPreviewing =
    previewingBlock?.groupId === group.id ||
    (previewingEdge &&
      (("groupId" in previewingEdge.from &&
        previewingEdge.from.groupId === group.id) ||
        (previewingEdge.to.groupId === group.id &&
          isNotDefined(previewingEdge.to.blockId))));

  const groupRef = useRef<HTMLDivElement | null>(null);
  const isDraggingGraph = useSelectionStore((state) => state.isDraggingGraph);
  const focusedGroups = useSelectionStore(
    useShallow((state) => state.focusedElementsId),
  );
  const groupCoordinates = useSelectionStore(
    useShallow((state) =>
      state.elementsCoordinates
        ? state.elementsCoordinates[group.id]
        : group.graphCoordinates,
    ),
  );
  const { moveFocusedElements, focusElement, getElementsCoordinates } =
    useSelectionStore(
      useShallow((state) => ({
        getElementsCoordinates: state.getElementsCoordinates,
        moveFocusedElements: state.moveFocusedElements,
        focusElement: state.focusElement,
      })),
    );

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.groupId === group.id &&
        isNotDefined(connectingIds.target?.blockId),
    );
  }, [connectingIds, group.id]);

  useEffect(() => {
    if (group.title !== groupTitle) setGroupTitle(group.title);
  }, [group.title]);

  const handleTitleSubmit = (title: string) =>
    updateGroup(groupIndex, { title });

  const handleMouseEnter = () => {
    if (isReadOnly) return;
    if (mouseOverGroup?.id !== group.id && groupRef.current)
      setMouseOverGroup({ id: group.id, ref: groupRef });
    if (connectingIds)
      setConnectingIds({ ...connectingIds, target: { groupId: group.id } });
  };

  const handleMouseLeave = () => {
    if (isReadOnly) return;
    setMouseOverGroup(undefined);
    if (connectingIds)
      setConnectingIds({ ...connectingIds, target: undefined });
  };

  const startPreviewAtThisGroup = () => {
    setStartPreviewFrom({ type: "group", id: group.id });
    setRightPanel("preview");
  };

  useDrag(
    ({ first, last, delta, event, target }) => {
      event.stopPropagation();
      if (
        (target as HTMLElement)
          .closest(".prevent-group-drag")
          ?.classList.contains("prevent-group-drag")
      )
        return;

      if (first) {
        setIsMouseDown(true);
        if (focusedGroups.find((id) => id === group.id) && !event.shiftKey)
          return;
        focusElement(group.id, event.shiftKey);
      }

      moveFocusedElements({
        x: delta[0] / graphPosition.scale,
        y: delta[1] / graphPosition.scale,
      });

      if (last) {
        const newElementsCoordinates = getElementsCoordinates();
        if (!newElementsCoordinates) return;
        updateGroupsCoordinates(newElementsCoordinates);
        setIsMouseDown(false);
      }
    },
    {
      target: groupRef,
      pointer: { keys: false },
      from: () => [
        groupCoordinates.x * graphPosition.scale,
        groupCoordinates.y * graphPosition.scale,
      ],
    },
  );

  const isFocused = focusedGroups.includes(group.id);

  return (
    <ContextMenu.Root
      onOpenChange={(open) => {
        setIsContextMenuOpened(open);
        if (open) focusElement(group.id);
      }}
      disabled={isReadOnly}
    >
      <ContextMenu.Trigger>
        <div
          style={
            {
              "--group-width": groupWidth + "px",
              transform: `translate(${groupCoordinates?.x ?? 0}px, ${
                groupCoordinates?.y ?? 0
              }px)`,
              touchAction: "none",
            } as React.CSSProperties
          }
          className={cx(
            "flex flex-col group px-4 pt-4 pb-2 rounded-xl border absolute gap-0 select-none bg-gray-1 w-(--group-width) transition-[border-color,box-shadow] hover:shadow-md",
            isConnecting || isContextMenuOpened || isPreviewing || isFocused
              ? "border-orange-8"
              : undefined,
            isMouseDown ? "cursor-grabbing" : "cursor-pointer",
            isFocused ? "z-10" : undefined,
            isDraggingGraph ? "pointer-events-none" : "pointer-events-auto",
          )}
          ref={groupRef}
          id={`group-${group.id}`}
          data-testid="group"
          data-selectable={group.id}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <SingleLineEditable
            value={groupTitle}
            input={{
              className: "prevent-group-drag",
              onValueChange: setGroupTitle,
            }}
            preview={{
              className: cx(
                isEmpty(groupTitle) &&
                  "absolute block left-4 top-2.5 w-[calc(100%-2rem)]  h-2",
              ),
            }}
            onValueCommit={handleTitleSubmit}
            className="font-medium pr-8"
          />
          {typebot && (
            <BlockNodesList
              blocks={group.blocks}
              groupIndex={groupIndex}
              groupRef={groupRef}
            />
          )}
          {focusedGroups.length === 1 && isFocused && (
            <GroupFocusToolbar
              className="absolute top-[-50px] right-0"
              groupId={group.id}
              isReadOnly={isReadOnly}
              onPlayClick={startPreviewAtThisGroup}
            />
          )}
        </div>
      </ContextMenu.Trigger>
      <GroupNodeContextMenuPopup />
    </ContextMenu.Root>
  );
};
