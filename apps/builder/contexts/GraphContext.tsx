import { Block, Step, Table, Target } from 'models'
import {
  createContext,
  Dispatch,
  MutableRefObject,
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

export type Node = Omit<Block, 'steps'> & {
  steps: (Step & {
    sourceAnchorsPosition: { left: Coordinates; right: Coordinates }
  })[]
}

const graphPositionDefaultValue = { x: 400, y: 100, scale: 1 }

export type ConnectingIds = {
  source: ConnectingSourceIds
  target?: Target
}

export type ConnectingSourceIds = {
  blockId: string
  stepId: string
  choiceItemId?: string
  conditionType?: 'true' | 'false'
}

type PreviewingIdsProps = { sourceId?: string; targetId?: string }

type StepId = string
type NodeId = string
export type Endpoint = {
  id: StepId | NodeId
  ref: MutableRefObject<HTMLDivElement | null>
}

const graphContext = createContext<{
  graphPosition: Position
  setGraphPosition: Dispatch<SetStateAction<Position>>
  connectingIds: ConnectingIds | null
  setConnectingIds: Dispatch<SetStateAction<ConnectingIds | null>>
  previewingIds: PreviewingIdsProps
  setPreviewingIds: Dispatch<SetStateAction<PreviewingIdsProps>>
  sourceEndpoints: Table<Endpoint>
  addSourceEndpoint: (endpoint: Endpoint) => void
  targetEndpoints: Table<Endpoint>
  addTargetEndpoint: (endpoint: Endpoint) => void
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({
  graphPosition: graphPositionDefaultValue,
  connectingIds: null,
})

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const [graphPosition, setGraphPosition] = useState(graphPositionDefaultValue)
  const [connectingIds, setConnectingIds] = useState<ConnectingIds | null>(null)
  const [previewingIds, setPreviewingIds] = useState<PreviewingIdsProps>({})
  const [sourceEndpoints, setSourceEndpoints] = useState<Table<Endpoint>>({
    byId: {},
    allIds: [],
  })
  const [targetEndpoints, setTargetEndpoints] = useState<Table<Endpoint>>({
    byId: {},
    allIds: [],
  })

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

  return (
    <graphContext.Provider
      value={{
        graphPosition,
        setGraphPosition,
        connectingIds,
        setConnectingIds,
        previewingIds,
        setPreviewingIds,
        sourceEndpoints,
        targetEndpoints,
        addSourceEndpoint,
        addTargetEndpoint,
      }}
    >
      {children}
    </graphContext.Provider>
  )
}

export const useGraph = () => useContext(graphContext)
