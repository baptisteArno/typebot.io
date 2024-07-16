import { createWithEqualityFn } from 'zustand/traditional'
import { Coordinates, CoordinatesMap } from '../types'
import { Edge, Group, GroupV6, Variable } from '@typebot.io/schemas'
import { subscribeWithSelector } from 'zustand/middleware'
import { share } from 'shared-zustand'

type Store = {
  focusedGroups: string[]
  groupsCoordinates: CoordinatesMap | undefined
  groupsInClipboard:
    | {
        groups: GroupV6[]
        edges: Edge[]
        variables: Omit<Variable, 'value'>[]
      }
    | undefined
  isDraggingGraph: boolean
  // TO-DO: remove once Typebot provider is migrated to a Zustand store. We will be able to get it internally in the store (if mutualized).
  getGroupsCoordinates: () => CoordinatesMap | undefined
  focusGroup: (groupId: string, isAppending?: boolean) => void
  blurGroups: () => void
  moveFocusedGroups: (delta: Coordinates) => void
  setFocusedGroups: (groupIds: string[]) => void
  setGroupsCoordinates: (groups: Group[] | undefined) => void
  updateGroupCoordinates: (groupId: string, newCoord: Coordinates) => void
  copyGroups: (args: {
    groups: GroupV6[]
    edges: Edge[]
    variables: Omit<Variable, 'value'>[]
  }) => void
  setIsDraggingGraph: (isDragging: boolean) => void
}

export const useGroupsStore = createWithEqualityFn<Store>()(
  subscribeWithSelector((set, get) => ({
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
                    x: Number(
                      (groupsCoordinates[groupId].x + delta.x).toFixed(2)
                    ),
                    y: Number(
                      (groupsCoordinates[groupId].y + delta.y).toFixed(2)
                    ),
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
    copyGroups: (groupsInClipboard) =>
      set({
        groupsInClipboard,
      }),
    setIsDraggingGraph: (isDragging) => set({ isDraggingGraph: isDragging }),
  }))
)

if ('BroadcastChannel' in globalThis) {
  share('groupsInClipboard', useGroupsStore)
}
