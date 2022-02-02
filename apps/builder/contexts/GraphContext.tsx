import { Block, Source, Step, Table, Target, Typebot } from 'models'
import {
  createContext,
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useImmer } from 'use-immer'

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

export type Node = Omit<Block, 'steps'> & {
  steps: (Step & {
    sourceAnchorsPosition: { left: Coordinates; right: Coordinates }
  })[]
}

const graphPositionDefaultValue = { x: 400, y: 100, scale: 1 }

export type ConnectingIds = {
  source: Source
  target?: Target
}

type StepId = string
type ButtonId = string
export type Endpoint = {
  id: StepId | ButtonId
  ref: MutableRefObject<HTMLDivElement | null>
}

export type BlocksCoordinates = { byId: { [key: string]: Coordinates } }

const graphContext = createContext<{
  blocksCoordinates?: BlocksCoordinates
  updateBlockCoordinates: (blockId: string, newCoord: Coordinates) => void
  graphPosition: Position
  setGraphPosition: Dispatch<SetStateAction<Position>>
  connectingIds: ConnectingIds | null
  setConnectingIds: Dispatch<SetStateAction<ConnectingIds | null>>
  previewingEdgeId?: string
  setPreviewingEdgeId: Dispatch<SetStateAction<string | undefined>>
  sourceEndpoints: Table<Endpoint>
  addSourceEndpoint: (endpoint: Endpoint) => void
  targetEndpoints: Table<Endpoint>
  addTargetEndpoint: (endpoint: Endpoint) => void
  openedStepId?: string
  setOpenedStepId: Dispatch<SetStateAction<string | undefined>>
  isReadOnly: boolean
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({
  graphPosition: graphPositionDefaultValue,
  connectingIds: null,
})

export const GraphProvider = ({
  children,
  typebot,
  isReadOnly = false,
}: {
  children: ReactNode
  typebot?: Typebot
  isReadOnly?: boolean
}) => {
  const [graphPosition, setGraphPosition] = useState(graphPositionDefaultValue)
  const [connectingIds, setConnectingIds] = useState<ConnectingIds | null>(null)
  const [previewingEdgeId, setPreviewingEdgeId] = useState<string>()
  const [sourceEndpoints, setSourceEndpoints] = useState<Table<Endpoint>>({
    byId: {},
    allIds: [],
  })
  const [targetEndpoints, setTargetEndpoints] = useState<Table<Endpoint>>({
    byId: {},
    allIds: [],
  })
  const [openedStepId, setOpenedStepId] = useState<string>()
  const [blocksCoordinates, setBlocksCoordinates] = useImmer<
    BlocksCoordinates | undefined
  >(undefined)

  useEffect(() => {
    setBlocksCoordinates(
      typebot?.blocks.allIds.reduce(
        (coords, blockId) => ({
          byId: {
            ...coords.byId,
            [blockId]: typebot.blocks.byId[blockId].graphCoordinates,
          },
        }),
        { byId: {} }
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot?.blocks])

  const addSourceEndpoint = (endpoint: Endpoint) => {
    setSourceEndpoints((endpoints) => ({
      byId: { ...endpoints.byId, [endpoint.id]: endpoint },
      allIds: [...endpoints.allIds, endpoint.id],
    }))
  }

  const addTargetEndpoint = (endpoint: Endpoint) => {
    setTargetEndpoints((endpoints) => ({
      byId: { ...endpoints.byId, [endpoint.id]: endpoint },
      allIds: [...endpoints.allIds, endpoint.id],
    }))
  }

  const updateBlockCoordinates = (blockId: string, newCoord: Coordinates) =>
    setBlocksCoordinates((blocksCoordinates) => {
      if (!blocksCoordinates) return
      blocksCoordinates.byId[blockId] = newCoord
    })

  return (
    <graphContext.Provider
      value={{
        graphPosition,
        setGraphPosition,
        connectingIds,
        setConnectingIds,
        previewingEdgeId,
        setPreviewingEdgeId,
        sourceEndpoints,
        targetEndpoints,
        addSourceEndpoint,
        addTargetEndpoint,
        openedStepId,
        setOpenedStepId,
        blocksCoordinates,
        updateBlockCoordinates,
        isReadOnly,
      }}
    >
      {children}
    </graphContext.Provider>
  )
}

export const useGraph = () => useContext(graphContext)
