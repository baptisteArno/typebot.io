import { Group } from '@typebot.io/schemas'
import {
  ReactNode,
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react'
import { Coordinates, CoordinatesMap } from '../types'

const groupsCoordinatesContext = createContext<{
  groupsCoordinates: CoordinatesMap
  updateGroupCoordinates: (groupId: string, newCoord: Coordinates) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const GroupsCoordinatesProvider = ({
  children,
  groups,
}: {
  children: ReactNode
  groups: Group[]
  isReadOnly?: boolean
}) => {
  const [groupsCoordinates, setGroupsCoordinates] = useState<CoordinatesMap>({})

  useEffect(() => {
    setGroupsCoordinates(
      groups.reduce(
        (coords, group) => ({
          ...coords,
          [group.id]: group.graphCoordinates,
        }),
        {}
      )
    )
  }, [groups])

  const updateGroupCoordinates = useCallback(
    (groupId: string, newCoord: Coordinates) =>
      setGroupsCoordinates((groupsCoordinates) => ({
        ...groupsCoordinates,
        [groupId]: newCoord,
      })),
    []
  )

  return (
    <groupsCoordinatesContext.Provider
      value={{ groupsCoordinates, updateGroupCoordinates }}
    >
      {children}
    </groupsCoordinatesContext.Provider>
  )
}

export const useGroupsCoordinates = () => useContext(groupsCoordinatesContext)
