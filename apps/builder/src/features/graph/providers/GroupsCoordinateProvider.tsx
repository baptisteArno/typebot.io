import { Group } from 'models'
import {
  ReactNode,
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react'
import { GroupsCoordinates, Coordinates } from './GraphProvider'

const groupsCoordinatesContext = createContext<{
  groupsCoordinates: GroupsCoordinates
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
  const [groupsCoordinates, setGroupsCoordinates] = useState<GroupsCoordinates>(
    {}
  )

  useEffect(() => {
    setGroupsCoordinates(
      groups.reduce(
        (coords, block) => ({
          ...coords,
          [block.id]: block.graphCoordinates,
        }),
        {}
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
