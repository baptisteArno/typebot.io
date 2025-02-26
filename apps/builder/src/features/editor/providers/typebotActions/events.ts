import type { CoordinatesMap } from "@/features/graph/types";
import { EventType } from "@typebot.io/events/constants";
import type { TDraggableEvent, TEvent } from "@typebot.io/events/schemas";
import { createId } from "@typebot.io/lib/createId";
import { byId } from "@typebot.io/lib/utils";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type { TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { produce } from "immer";
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
    events: TDraggableEvent[],
    edges: Edge[],
    oldToNewIdsMapping: Map<string, string>,
  ) => void;
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
        typebot.events[eventIndex] = { ...event, ...updates };
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
  pasteEvents: (events, edges, oldToNewIdsMapping) => {
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const edgesToCreate: Edge[] = [];
        typebot.events.push(...events);
        events.forEach((event) => {
          const edge = edges.find(byId(event.outgoingEdgeId));
          if (edge) {
            event.outgoingEdgeId = createId();
            edgesToCreate.push({
              ...edge,
              id: event.outgoingEdgeId,
            });
            oldToNewIdsMapping.set(event.id, event.outgoingEdgeId);
          } else {
            event.outgoingEdgeId = undefined;
          }
        });

        edgesToCreate.forEach((edge) => {
          if (!("eventId" in edge.from)) return;
          const fromEventId = oldToNewIdsMapping.get(edge.from.eventId);
          const toGroupId = oldToNewIdsMapping.get(edge.to.groupId);
          if (!fromEventId || !toGroupId) return;
          const newEdge: Edge = {
            ...edge,
            from: {
              ...edge.from,
              eventId: fromEventId,
            },
            to: {
              ...edge.to,
              groupId: toGroupId,
              blockId: edge.to.blockId
                ? oldToNewIdsMapping.get(edge.to.blockId)
                : undefined,
            },
          };
          typebot.edges.push(newEdge);
        });
      }),
    );
  },
});

export { eventsActions };
