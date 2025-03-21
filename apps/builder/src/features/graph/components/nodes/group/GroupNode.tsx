import { ContextMenu } from "@/components/ContextMenu";
import { useEditor } from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { groupWidth } from "@/features/graph/constants";
import { useSelectionStore } from "@/features/graph/hooks/useSelectionStore";
import { useBlockDnd } from "@/features/graph/providers/GraphDndProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { setMultipleRefs } from "@/helpers/setMultipleRefs";
import { useRightPanel } from "@/hooks/useRightPanel";
import {
  Editable,
  EditableInput,
  EditablePreview,
  SlideFade,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import { isEmpty, isNotDefined } from "@typebot.io/lib/utils";
import { useDrag } from "@use-gesture/react";
import React, { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { BlockNodesList } from "../block/BlockNodesList";
import { GroupFocusToolbar } from "./GroupFocusToolbar";
import { GroupNodeContextMenu } from "./GroupNodeContextMenu";
type Props = {
  group: GroupV6;
  groupIndex: number;
};

export const GroupNode = ({ group, groupIndex }: Props) => {
  const bg = useColorModeValue("white", "gray.950");
  const previewingBorderColor = useColorModeValue("orange.400", "orange.300");
  const editableHoverBg = useColorModeValue("gray.200", "gray.700");
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
      setMouseOverGroup({ id: group.id, element: groupRef.current });
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
    <ContextMenu<HTMLDivElement>
      onOpen={() => focusElement(group.id)}
      renderMenu={() => <GroupNodeContextMenu />}
      isDisabled={isReadOnly}
    >
      {(ref, isContextMenuOpened) => (
        <Stack
          ref={setMultipleRefs([ref, groupRef])}
          id={`group-${group.id}`}
          data-testid="group"
          className="group"
          data-selectable={group.id}
          userSelect="none"
          px="4"
          pt="4"
          pb="2"
          rounded="xl"
          bg={bg}
          borderWidth="1px"
          borderColor={
            isConnecting || isContextMenuOpened || isPreviewing || isFocused
              ? previewingBorderColor
              : undefined
          }
          w={groupWidth}
          transition="border 300ms, box-shadow 200ms"
          pos="absolute"
          style={{
            transform: `translate(${groupCoordinates?.x ?? 0}px, ${
              groupCoordinates?.y ?? 0
            }px)`,
            touchAction: "none",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          cursor={isMouseDown ? "grabbing" : "pointer"}
          _hover={{ shadow: "md" }}
          zIndex={isFocused ? 1 : undefined}
          spacing={0}
          pointerEvents={isDraggingGraph ? "none" : "auto"}
        >
          <Editable
            value={groupTitle}
            onChange={setGroupTitle}
            onSubmit={handleTitleSubmit}
            fontWeight="medium"
            pr="8"
          >
            <EditablePreview
              _hover={{
                bg: editableHoverBg,
              }}
              px="1"
              style={
                isEmpty(groupTitle)
                  ? {
                      display: "block",
                      position: "absolute",
                      top: "10px",
                      width: "50px",
                    }
                  : undefined
              }
            />
            <EditableInput minW="0" px="1" className="prevent-group-drag" />
          </Editable>
          {typebot && (
            <BlockNodesList
              blocks={group.blocks}
              groupIndex={groupIndex}
              groupRef={ref}
            />
          )}
          {focusedGroups.length === 1 && (
            <SlideFade
              in={isFocused}
              style={{
                position: "absolute",
                top: "-50px",
                right: 0,
              }}
              unmountOnExit
            >
              <GroupFocusToolbar
                groupId={group.id}
                isReadOnly={isReadOnly}
                onPlayClick={startPreviewAtThisGroup}
              />
            </SlideFade>
          )}
        </Stack>
      )}
    </ContextMenu>
  );
};
