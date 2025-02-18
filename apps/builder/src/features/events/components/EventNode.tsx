import { ContextMenu } from "@/components/ContextMenu";
import {
  RightPanel,
  useEditor,
} from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { SettingsModal } from "@/features/graph/components/nodes/block/SettingsModal";
import {
  NodeSettings,
  SettingsPopoverContent,
} from "@/features/graph/components/nodes/block/SettingsPopoverContent";
import { eventWidth } from "@/features/graph/constants";
import { useSelectionStore } from "@/features/graph/hooks/useSelectionStore";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { ParentModalProvider } from "@/features/graph/providers/ParentModalProvider";
import { setMultipleRefs } from "@/helpers/setMultipleRefs";
import {
  Popover,
  PopoverTrigger,
  SlideFade,
  Stack,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import type { BlockWithOptions } from "@typebot.io/blocks-core/schemas/schema";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent, TEventWithOptions } from "@typebot.io/events/schemas";
import { useDrag } from "@use-gesture/react";
import React, { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { EventSourceEndpoint } from "../../graph/components/endpoints/EventSourceEndpoint";
import { EventFocusToolbar } from "./EventFocusToolbar";
import { EventNodeContent } from "./EventNodeContent";
import { EventNodeContextMenu } from "./EventNodeContextMenu";

type Props = {
  event: TEvent;
  eventIndex: number;
};

export const EventNode = ({ event, eventIndex }: Props) => {
  const { openedNodeId, setOpenedNodeId } = useGraph();
  const elementBgColor = useColorModeValue("white", "gray.950");
  const previewingBorderColor = useColorModeValue("orange.400", "orange.300");
  const { previewingEdge, isReadOnly, graphPosition } = useGraph();
  const { updateEvent, deleteEvent, updateEventsCoordinates } = useTypebot();
  const { setRightPanel, setStartPreviewFrom } = useEditor();
  const [isMouseDown, setIsMouseDown] = useState(false);

  const focusedElements = useSelectionStore(
    useShallow((state) => state.focusedElementsId),
  );
  const eventCoordinates = useSelectionStore(
    useShallow((state) =>
      state.elementsCoordinates
        ? state.elementsCoordinates[event.id]
        : event.graphCoordinates,
    ),
  );
  const {
    moveFocusedElements,
    focusElement,
    getElementsCoordinates,
    blurElements,
  } = useSelectionStore(
    useShallow((state) => ({
      getElementsCoordinates: state.getElementsCoordinates,
      moveFocusedElements: state.moveFocusedElements,
      focusElement: state.focusElement,
      blurElements: state.blurElements,
    })),
  );

  const isPreviewing = previewingEdge
    ? "eventId" in previewingEdge.from
      ? previewingEdge.from.eventId === event.id
      : false
    : false;

  const eventRef = useRef<HTMLDivElement | null>(null);
  const isDraggingGraph = useSelectionStore((state) => state.isDraggingGraph);

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const startPreviewAtThisEvent = () => {
    setStartPreviewFrom({ type: "event", id: event.id });
    setRightPanel(RightPanel.PREVIEW);
  };

  const handleOnNodeChange = (
    updates: Partial<BlockWithOptions | TEventWithOptions>,
  ) => updateEvent(eventIndex, { ...event, ...updates } as TEvent);

  const handleModalClose = () => {
    updateEvent(eventIndex, { ...event });
    onModalClose();
  };

  useDrag(
    ({ first, last, delta, event: dragEvent }) => {
      dragEvent.stopPropagation();

      if (first) {
        setIsMouseDown(true);
        if (
          focusedElements.find((id) => id === event.id) &&
          !dragEvent.shiftKey
        )
          return;
        focusElement(event.id, dragEvent.shiftKey);
      }

      moveFocusedElements({
        x: delta[0] / graphPosition.scale,
        y: delta[1] / graphPosition.scale,
      });

      if (last) {
        const newElementsCoordinates = getElementsCoordinates();
        if (!newElementsCoordinates) return;
        updateEventsCoordinates(newElementsCoordinates);
        setIsMouseDown(false);
      }
    },
    {
      target: eventRef,
      pointer: { keys: false },
      from: () => [
        eventCoordinates.x * graphPosition.scale,
        eventCoordinates.y * graphPosition.scale,
      ],
    },
  );

  const isFocused = focusedElements.includes(event.id);

  return (
    <ContextMenu<HTMLDivElement>
      onOpen={() => focusElement(event.id)}
      renderMenu={() => <EventNodeContextMenu />}
      isDisabled={isReadOnly || event.type === "start"}
    >
      {(ref, isContextMenuOpened) => (
        <Popover
          placement="left"
          isLazy
          isOpen={openedNodeId === event.id}
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Stack
              ref={setMultipleRefs([ref, eventRef])}
              data-moving-element={`event-${event.id}`}
              data-selectable={event.id}
              userSelect="none"
              data-testid="event"
              py="2"
              pl="3"
              pr="3"
              w={eventWidth}
              rounded="xl"
              bg={elementBgColor}
              borderWidth="1px"
              fontWeight="medium"
              borderColor={
                isContextMenuOpened || isPreviewing || isFocused
                  ? previewingBorderColor
                  : undefined
              }
              transition="border 300ms, box-shadow 200ms"
              pos="absolute"
              style={{
                transform: `translate(${eventCoordinates?.x ?? 0}px, ${
                  eventCoordinates?.y ?? 0
                }px)`,
                touchAction: "none",
              }}
              cursor={isMouseDown ? "grabbing" : "pointer"}
              _hover={{ shadow: "md" }}
              zIndex={isFocused ? 10 : 1}
              pointerEvents={isDraggingGraph ? "none" : "auto"}
            >
              <EventNodeContent event={event} />
              <EventSourceEndpoint
                source={{
                  eventId: event.id,
                }}
                pos="absolute"
                right="-19px"
                bottom="4px"
                isHidden={false}
              />
              {!isReadOnly && (
                <SlideFade
                  in={isFocused && focusedElements.length === 1}
                  style={{
                    position: "absolute",
                    top: "-45px",
                    right: 0,
                  }}
                  unmountOnExit
                >
                  <EventFocusToolbar
                    eventId={event.id}
                    type={event.type}
                    onPlayClick={startPreviewAtThisEvent}
                    onSettingsClick={() => {
                      blurElements();
                      setOpenedNodeId(event.id);
                    }}
                  />
                </SlideFade>
              )}
            </Stack>
          </PopoverTrigger>
          {hasSettingsPopover(event) && (
            <>
              <SettingsPopoverContent
                node={event}
                groupId={undefined}
                onExpandClick={onModalOpen}
                onNodeChange={handleOnNodeChange}
              />
              <ParentModalProvider>
                <SettingsModal isOpen={isModalOpen} onClose={handleModalClose}>
                  <NodeSettings
                    node={event}
                    groupId={undefined}
                    onNodeChange={handleOnNodeChange}
                  />
                </SettingsModal>
              </ParentModalProvider>
            </>
          )}
        </Popover>
      )}
    </ContextMenu>
  );
};

const hasSettingsPopover = (event: TEvent): event is TEventWithOptions =>
  event.type !== EventType.START;
