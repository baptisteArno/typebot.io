import { Group, Edge, IdMap, Source, Block, Target } from 'models'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

export const stubLength = 20
export const blockWidth = 300
export const blockAnchorsOffset = {
  left: {
    x: 0,
    y: 20,
  },
  top: {
    x: blockWidth / 2,
    y: 0,
  },
  right: {
    x: blockWidth,
    y: 20,
  },
}

export type Coordinates = { x: number; y: number }

type Position = Coordinates & { scale: number }

export type Anchor = {
  coordinates: Coordinates
}

export type Node = Omit<Group, 'blocks'> & {
  blocks: (Block & {
    sourceAnchorsPosition: { left: Coordinates; right: Coordinates }
  })[]
}

export const graphPositionDefaultValue = (
  firstGroupCoordinates: Coordinates
) => ({
  x: 400 - firstGroupCoordinates.x,
  y: 100 - firstGroupCoordinates.y,
  scale: 1,
})

export type ConnectingIds = {
  source: Source
  target?: Target
}

export type GroupsCoordinates = IdMap<Coordinates>

type PreviewingBlock = {
  id: string
  groupId: string
}

const graphContext = createContext<{
  graphPosition: Position
  setGraphPosition: Dispatch<SetStateAction<Position>>
  connectingIds: ConnectingIds | null
  setConnectingIds: Dispatch<SetStateAction<ConnectingIds | null>>
  previewingBlock?: PreviewingBlock
  setPreviewingBlock: Dispatch<SetStateAction<PreviewingBlock | undefined>>
  previewingEdge?: Edge
  setPreviewingEdge: Dispatch<SetStateAction<Edge | undefined>>
  openedBlockId?: string
  setOpenedBlockId: Dispatch<SetStateAction<string | undefined>>
  openedItemId?: string
  setOpenedItemId: Dispatch<SetStateAction<string | undefined>>
  isReadOnly: boolean
  focusedGroupId?: string
  setFocusedGroupId: Dispatch<SetStateAction<string | undefined>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({
  graphPosition: graphPositionDefaultValue({ x: 0, y: 0 }),
  connectingIds: null,
})

export const GraphProvider = ({
  children,
  isReadOnly = false,
}: {
  children: ReactNode
  isReadOnly?: boolean
}) => {
  const [graphPosition, setGraphPosition] = useState(
    graphPositionDefaultValue({ x: 0, y: 0 })
  )
  const [connectingIds, setConnectingIds] = useState<ConnectingIds | null>(null)
  const [previewingEdge, setPreviewingEdge] = useState<Edge>()
  const [previewingBlock, setPreviewingBlock] = useState<PreviewingBlock>()
  const [openedBlockId, setOpenedBlockId] = useState<string>()
  const [openedItemId, setOpenedItemId] = useState<string>()
  const [focusedGroupId, setFocusedGroupId] = useState<string>()

  return (
    <graphContext.Provider
      value={{
        graphPosition,
        setGraphPosition,
        connectingIds,
        setConnectingIds,
        previewingEdge,
        setPreviewingEdge,
        openedBlockId,
        setOpenedBlockId,
        openedItemId,
        setOpenedItemId,
        isReadOnly,
        focusedGroupId,
        setFocusedGroupId,
        setPreviewingBlock,
        previewingBlock,
      }}
    >
      {children}
    </graphContext.Provider>
  )
}

export const useGraph = () => useContext(graphContext)
