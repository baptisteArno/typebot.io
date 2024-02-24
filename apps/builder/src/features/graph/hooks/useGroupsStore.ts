import { createWithEqualityFn } from 'zustand/traditional'
import { Coordinates, CoordinatesMap } from '../types'
import { Edge, Group, GroupV6 } from '@typebot.io/schemas'

type Store = {
  focusedGroups: string[]
  groupsCoordinates: CoordinatesMap | undefined
  groupsInClipboard: { groups: GroupV6[]; edges: Edge[] } | undefined
  isDraggingGraph: boolean
  // TO-DO: remove once Typebot provider is migrated to a Zustand store. We will be able to get it internally in the store (if mutualized).
  getGroupsCoordinates: () => CoordinatesMap | undefined
  focusGroup: (groupId: string, isAppending?: boolean) => void
  blurGroups: () => void
  moveFocusedGroups: (delta: Coordinates) => void
  setFocusedGroups: (groupIds: string[]) => void
  setGroupsCoordinates: (groups: Group[] | undefined) => void
  updateGroupCoordinates: (groupId: string, newCoord: Coordinates) => void
  copyGroups: (groups: GroupV6[], edges: Edge[]) => void
  setIsDraggingGraph: (isDragging: boolean) => void
}

export const useGroupsStore = createWithEqualityFn<Store>((set, get) => ({
  focusedGroups: [],
  groupsCoordinates: undefined,
  groupsInClipboard: undefined,
  isDraggingGraph: false,
  getGroupsCoordinates: () => get().groupsCoordinates,
  focusGroup: (groupId, isShiftKeyPressed) =>
    set((state) => ({
      focusedGroups: isShiftKeyPressed
        ? state.focusedGroups.includes(groupId)
          ? state.focusedGroups.filter((id) => id !== groupId)
          : [...state.focusedGroups, groupId]
        : [groupId],
    })),
  blurGroups: () => set({ focusedGroups: [] }),
  moveFocusedGroups: (delta) =>
    set(({ focusedGroups, groupsCoordinates }) => ({
      groupsCoordinates: groupsCoordinates
        ? {
            ...groupsCoordinates,
            ...focusedGroups.reduce(
              (coords, groupId) => ({
                ...coords,
                [groupId]: {
                  x: groupsCoordinates[groupId].x + delta.x,
                  y: groupsCoordinates[groupId].y + delta.y,
                },
              }),
              groupsCoordinates
            ),
          }
        : undefined,
    })),
  setFocusedGroups: (groupIds) => set({ focusedGroups: groupIds }),
  setGroupsCoordinates: (groups) =>
    set({
      groupsCoordinates: groups
        ? groups.reduce(
            (coords, group) => ({
              ...coords,
              [group.id]: {
                x: group.graphCoordinates.x,
                y: group.graphCoordinates.y,
              },
            }),
            {}
          )
        : undefined,
    }),
  updateGroupCoordinates: (groupId, newCoord) => {
    set((state) => ({
      groupsCoordinates: {
        ...state.groupsCoordinates,
        [groupId]: newCoord,
      },
    }))
  },
  copyGroups: (groups, edges) =>
    set({
      groupsInClipboard: {
        groups,
        edges,
      },
    }),
  setIsDraggingGraph: (isDragging) => set({ isDraggingGraph: isDragging }),
}))
