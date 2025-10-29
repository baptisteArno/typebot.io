import type { BlockWithOptions } from "@typebot.io/blocks-core/schemas/schema";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent, TEventWithOptions } from "@typebot.io/events/schemas";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { Popover } from "@typebot.io/ui/components/Popover";
import { cx } from "@typebot.io/ui/lib/cva";
import { useDrag } from "@use-gesture/react";
import { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useEditor } from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { SettingsPopoverContent } from "@/features/graph/components/nodes/block/SettingsPopoverContent";
import { eventWidth } from "@/features/graph/constants";
import { useSelectionStore } from "@/features/graph/hooks/useSelectionStore";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { setMultipleRefs } from "@/helpers/setMultipleRefs";
import { useRightPanel } from "@/hooks/useRightPanel";
import { EventSourceEndpoint } from "../../graph/components/endpoints/EventSourceEndpoint";
import { EventFocusToolbar } from "./EventFocusToolbar";
import { EventNodeContent } from "./EventNodeContent";
import { EventNodeContextMenuPopup } from "./EventNodeContextMenuPopup";

const CLOSE_SETTINGS_POPOVER_ANIMATION_DURATION = 150;

type Props = {
  event: TEvent;
  eventIndex: number;
};

export const EventNode = ({ event, eventIndex }: Props) => {
  const { previewingEdge, isReadOnly, graphPosition } = useGraph();
  const { updateEvent, updateEventsCoordinates } = useTypebot();
  const { setStartPreviewFrom } = useEditor();
  const [, setRightPanel] = useRightPanel();
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);
  const { openedNodeId, setOpenedNodeId } = useGraph();

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

  const startPreviewAtThisEvent = () => {
    setStartPreviewFrom({ type: "event", id: event.id });
    setRightPanel("preview");
  };

  const handleOnNodeChange = (
    updates: Partial<BlockWithOptions | TEventWithOptions>,
  ) => updateEvent(eventIndex, { ...event, ...updates } as TEvent);

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
    <ContextMenu.Root
      onOpenChange={(open) => {
        setIsContextMenuOpened(open);
        if (open) focusElement(event.id);
      }}
      disabled={isReadOnly || event.type === "start"}
    >
      <ContextMenu.Trigger>
        <Popover.Root
          isOpen={openedNodeId === event.id}
          onClose={() => {
            setOpenedNodeId(undefined);
            setTimeout(
              () => setIsExpanded(false),
              CLOSE_SETTINGS_POPOVER_ANIMATION_DURATION,
            );
          }}
        >
          <Popover.Trigger
            render={(props) => (
              <div
                style={
                  {
                    "--width": eventWidth + "px",
                    transform: `translate(${eventCoordinates?.x ?? 0}px, ${
                      eventCoordinates?.y ?? 0
                    }px)`,
                    touchAction: "none",
                  } as React.CSSProperties
                }
                className={cx(
                  "flex flex-col gap-2 py-2 pl-3 pr-3 rounded-xl border font-medium absolute w-(--width) bg-gray-1 select-none transition-[border-color,box-shadow] hover:shadow-md",
                  isContextMenuOpened || isPreviewing || isFocused
                    ? "border-orange-8"
                    : undefined,
                  isMouseDown ? "cursor-grabbing" : "cursor-pointer",
                  isFocused ? "z-10" : undefined,
                  isDraggingGraph
                    ? "pointer-events-none"
                    : "pointer-events-auto",
                )}
                {...props}
                ref={setMultipleRefs([eventRef, props.ref!])}
                data-moving-element={`event-${event.id}`}
                data-selectable={event.id}
              >
                <EventNodeContent event={event} />
                <EventSourceEndpoint
                  source={{
                    eventId: event.id,
                  }}
                  className="absolute right-[-19px] bottom-[3px]"
                  isHidden={false}
                />
                {!isReadOnly && isFocused && focusedElements.length === 1 && (
                  <EventFocusToolbar
                    className="absolute top-[-45px] right-0 animate-in fade-in-0 slide-in-from-bottom-2"
                    eventId={event.id}
                    type={event.type}
                    onPlayClick={startPreviewAtThisEvent}
                    onSettingsClick={() => {
                      blurElements();
                      setOpenedNodeId(event.id);
                    }}
                  />
                )}
              </div>
            )}
          />

          {hasSettingsPopover(event) && (
            <SettingsPopoverContent
              node={event}
              groupId={undefined}
              onNodeChange={handleOnNodeChange}
              isExpanded={isExpanded}
              onExpandClick={() => setIsExpanded(!isExpanded)}
              side="left"
            />
          )}
        </Popover.Root>
      </ContextMenu.Trigger>
      <EventNodeContextMenuPopup />
    </ContextMenu.Root>
  );
};

const hasSettingsPopover = (event: TEvent): event is TEventWithOptions =>
  event.type !== EventType.START;
