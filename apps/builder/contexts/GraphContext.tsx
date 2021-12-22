import { Block, Step, StepType, Target } from 'bot-engine'
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
export const firstStepOffsetY = 88
export const spaceBetweenSteps = 62

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

export type NewBlockPayload = {
  x: number
  y: number
  type?: StepType
  step?: Step
}

const graphPositionDefaultValue = { x: 400, y: 100, scale: 1 }

const graphContext = createContext<{
  graphPosition: Position
  setGraphPosition: Dispatch<SetStateAction<Position>>
  connectingIds: { blockId: string; stepId: string; target?: Target } | null
  setConnectingIds: Dispatch<
    SetStateAction<{ blockId: string; stepId: string; target?: Target } | null>
  >
  previewingIds: { sourceId?: string; targetId?: string }
  setPreviewingIds: Dispatch<
    SetStateAction<{ sourceId?: string; targetId?: string }>
  >
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({
  graphPosition: graphPositionDefaultValue,
  connectingIds: null,
})

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const [graphPosition, setGraphPosition] = useState(graphPositionDefaultValue)
  const [connectingIds, setConnectingIds] = useState<{
    blockId: string
    stepId: string
    target?: Target
  } | null>(null)
  const [previewingIds, setPreviewingIds] = useState<{
    sourceId?: string
    targetId?: string
  }>({})

  return (
    <graphContext.Provider
      value={{
        graphPosition,
        setGraphPosition,
        connectingIds,
        setConnectingIds,
        previewingIds,
        setPreviewingIds,
      }}
    >
      {children}
    </graphContext.Provider>
  )
}

export const useGraph = () => useContext(graphContext)
