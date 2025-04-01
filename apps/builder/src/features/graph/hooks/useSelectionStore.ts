import type { TDraggableEvent, TEvent } from "@typebot.io/events/schemas";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type { Variable } from "@typebot.io/variables/schemas";
import { share } from "shared-zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import type { Coordinates, CoordinatesMap } from "../types";

type SelectionStore = {
  focusedElementsId: string[];
  elementsCoordinates: CoordinatesMap | undefined;
  elementsInClipboard:
    | {
        events: TDraggableEvent[];
        groups: GroupV6[];
        edges: Edge[];
        variables: Omit<Variable, "value">[];
      }
    | undefined;
  isDraggingGraph: boolean;
  // TODO: remove once Typebot provider is migrated to a Zustand store. We will be able to get it internally in the store (if mutualized).
  getElementsCoordinates: () => CoordinatesMap | undefined;
  focusElement: (id: string, isAppending?: boolean) => void;
  blurElements: () => void;
  moveFocusedElements: (delta: Coordinates) => void;
  setFocusedElements: (ids: string[]) => void;
  setElementsCoordinates: (
    props:
      | {
          groups: GroupV6[];
          events: TEvent[];
        }
      | undefined,
  ) => void;
  updateElementCoordinates: (id: string, newCoord: Coordinates) => void;
  copyElements: (args: {
    groups: GroupV6[];
    events: TDraggableEvent[];
    edges: Edge[];
    variables: Omit<Variable, "value">[];
  }) => void;
  setIsDraggingGraph: (isDragging: boolean) => void;
};

export const useSelectionStore = createWithEqualityFn<SelectionStore>()(
  subscribeWithSelector((set, get) => ({
    focusedElementsId: [],
    elementsCoordinates: undefined,
    elementsInClipboard: undefined,
    isDraggingGraph: false,
    getElementsCoordinates: () => get().elementsCoordinates,
    focusElement: (groupId, isShiftKeyPressed) =>
      set((state) => ({
        focusedElementsId: isShiftKeyPressed
          ? state.focusedElementsId.includes(groupId)
            ? state.focusedElementsId.filter((id) => id !== groupId)
            : [...state.focusedElementsId, groupId]
          : [groupId],
      })),
    blurElements: () => set({ focusedElementsId: [] }),
    moveFocusedElements: (delta) =>
      set(
        ({
          focusedElementsId: focusedGroups,
          elementsCoordinates: groupsCoordinates,
        }) => ({
          elementsCoordinates: groupsCoordinates
            ? {
                ...groupsCoordinates,
                ...focusedGroups.reduce(
                  (coords, groupId) => ({
                    ...coords,
                    [groupId]: {
                      x: Number(
                        (groupsCoordinates[groupId].x + delta.x).toFixed(2),
                      ),
                      y: Number(
                        (groupsCoordinates[groupId].y + delta.y).toFixed(2),
                      ),
                    },
                  }),
                  groupsCoordinates,
                ),
              }
            : undefined,
        }),
      ),
    setFocusedElements: (groupIds) => set({ focusedElementsId: groupIds }),
    setElementsCoordinates: (props) =>
      set({
        elementsCoordinates: props
          ? {
              ...props.groups.reduce(
                (coords, group) => ({
                  ...coords,
                  [group.id]: {
                    x: group.graphCoordinates.x,
                    y: group.graphCoordinates.y,
                  },
                }),
                {},
              ),
              ...props.events.reduce(
                (coords, event) => ({
                  ...coords,
                  [event.id]: {
                    x: event.graphCoordinates.x,
                    y: event.graphCoordinates.y,
                  },
                }),
                {},
              ),
            }
          : undefined,
      }),
    updateElementCoordinates: (groupId, newCoord) => {
      set((state) => ({
        elementsCoordinates: {
          ...state.elementsCoordinates,
          [groupId]: newCoord,
        },
      }));
    },
    copyElements: (groupsInClipboard) =>
      set({
        elementsInClipboard: groupsInClipboard,
      }),
    setIsDraggingGraph: (isDragging) => set({ isDraggingGraph: isDragging }),
  })),
);

if ("BroadcastChannel" in globalThis) {
  share("elementsInClipboard", useSelectionStore);
}
