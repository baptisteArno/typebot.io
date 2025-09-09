import { EventType } from "@typebot.io/events/constants";
import type { TDraggableEvent, TEvent } from "@typebot.io/events/schemas";
import { createId } from "@typebot.io/lib/createId";
import { byId, isDefined } from "@typebot.io/lib/utils";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { produce } from "immer";
import type { Coordinates, CoordinatesMap } from "@/features/graph/types";
import type { SetTypebot } from "../TypebotProvider";
import { deleteConnectedEdgesDraft } from "./edges";

export type EventsActions = {
  createEvent: (
    event: Pick<TEvent, "graphCoordinates" | "type" | "id">,
  ) => void;
  updateEvent: (
    eventIndex: number,
    updates: Partial<Omit<TEvent, "id">>,
  ) => void;
  deleteEvent: (eventIndex: number) => void;
  deleteEvents: (eventIds: string[]) => void;
  updateEventsCoordinates: (newCoord: CoordinatesMap) => void;
  pasteEvents: (
    clipboard: {
      events: TDraggableEvent[];
      edges: Edge[];
    },
    params: {
      oldToNewIdsMapping: Map<string, string>;
      updateCoordinates: {
        mousePosition: Coordinates;
        farLeftElement: {
          id: string;
        } & Coordinates;
      };
    },
  ) => { newEvents: TDraggableEvent[] };
};

const eventsActions = (setTypebot: SetTypebot): EventsActions => ({
  createEvent: (event) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        typebot.events.push(event);
      }),
    );
  },
  updateEvent: (eventIndex, updates) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const event = typebot.events[eventIndex];
        typebot.events[eventIndex] = {
          ...event,
          ...updates,
        } as typeof event;
      }),
    ),
  deleteEvent: (eventIndex) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteConnectedEdgesDraft(typebot, typebot.events[eventIndex].id);
        typebot.events.splice(eventIndex, 1);
      }),
    ),
  deleteEvents: (eventIds) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        eventIds.forEach((eventId) =>
          deleteConnectedEdgesDraft(typebot, eventId),
        );
        typebot.events = typebot.events.filter(
          (event) =>
            !eventIds.includes(event.id) || event.type === EventType.START,
        ) as TypebotV6["events"];
      }),
    ),
  updateEventsCoordinates: (newCoord) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        typebot.events.forEach(
          (event) => (event.graphCoordinates = newCoord[event.id]),
        );
      }),
    ),
  pasteEvents: (clipboard, { oldToNewIdsMapping, updateCoordinates }) => {
    let newEvents: TDraggableEvent[] = [];
    setTypebot((typebot) => {
      const newEdgesWithOldIds: Edge[] = [];
      newEvents = clipboard.events.map((event) => {
        const { newEdge, newEvent } = duplicateEvent(event, {
          edges: clipboard.edges,
        });
        if (newEdge) newEdgesWithOldIds.push(newEdge);
        return {
          ...newEvent,
          graphCoordinates:
            event.id === updateCoordinates.farLeftElement.id
              ? updateCoordinates.mousePosition
              : {
                  x:
                    updateCoordinates.mousePosition.x +
                    event.graphCoordinates.x -
                    updateCoordinates.farLeftElement.x,
                  y:
                    updateCoordinates.mousePosition.y +
                    event.graphCoordinates.y -
                    updateCoordinates.farLeftElement.y,
                },
        };
      });
      const edgesToCreate = newEdgesWithOldIds
        .map((edge) => {
          if (!("eventId" in edge.from)) return;
          const toGroupId = oldToNewIdsMapping.get(edge.to.groupId);
          if (!toGroupId) return;
          return {
            ...edge,
            to: {
              groupId: toGroupId,
              blockId: edge.to.blockId
                ? oldToNewIdsMapping.get(edge.to.blockId)
                : undefined,
            },
          } satisfies Edge;
        })
        .filter(isDefined);
      return produce(typebot, (typebot) => {
        typebot.events.push(...newEvents);
        typebot.edges.push(...edgesToCreate);
      });
    });
    return { newEvents };
  },
});

const duplicateEvent = (
  event: TDraggableEvent,
  { edges }: { edges: Edge[] },
): { newEvent: TDraggableEvent; newEdge: Edge | undefined } => {
  const associatedEdge = event.outgoingEdgeId
    ? edges.find(byId(event.outgoingEdgeId))
    : undefined;
  const newEventId = createId();
  const newEdge = associatedEdge
    ? {
        ...associatedEdge,
        id: createId(),
        from: {
          eventId: newEventId,
        },
      }
    : undefined;
  const newEvent = {
    ...event,
    id: newEventId,
    outgoingEdgeId: newEdge?.id,
  };
  return { newEvent, newEdge };
};

export { eventsActions };
