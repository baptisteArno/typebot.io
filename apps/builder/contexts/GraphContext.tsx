import { Block, StartBlock, Step, StepType, Target } from 'bot-engine'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'
import { parseNewBlock, parseNewStep } from 'services/graph'
import { insertItemInList } from 'services/utils'

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
export const spaceBetweenSteps = 66

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
  startBlock?: StartBlock
  setStartBlock: Dispatch<SetStateAction<StartBlock | undefined>>
  blocks: Block[]
  setBlocks: Dispatch<SetStateAction<Block[]>>
  addNewBlock: (props: NewBlockPayload) => void
  updateBlockPosition: (blockId: string, newPositon: Coordinates) => void
  addNewStepToBlock: (
    blockId: string,
    step: StepType | Step,
    index: number
  ) => void
  removeStepFromBlock: (blockId: string, stepId: string) => void
  addTarget: (connectingIds: {
    blockId: string
    stepId: string
    target?: Target
  }) => void
  removeTarget: (connectingIds: { blockId: string; stepId: string }) => void
}>({
  graphPosition: graphPositionDefaultValue,
  setGraphPosition: () => console.log("I'm not instantiated"),
  connectingIds: null,
  setConnectingIds: () => console.log("I'm not instantiated"),
  blocks: [],
  setBlocks: () => console.log("I'm not instantiated"),
  updateBlockPosition: () => console.log("I'm not instantiated"),
  addNewStepToBlock: () => console.log("I'm not instantiated"),
  addNewBlock: () => console.log("I'm not instantiated"),
  removeStepFromBlock: () => console.log("I'm not instantiated"),
  addTarget: () => console.log("I'm not instantiated"),
  removeTarget: () => console.log("I'm not instantiated"),
  setStartBlock: () => console.log("I'm not instantiated"),
})

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const [graphPosition, setGraphPosition] = useState(graphPositionDefaultValue)
  const [connectingIds, setConnectingIds] = useState<{
    blockId: string
    stepId: string
    target?: Target
  } | null>(null)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [startBlock, setStartBlock] = useState<StartBlock | undefined>()

  const addNewBlock = ({ x, y, type, step }: NewBlockPayload) => {
    const boardCoordinates = {
      x,
      y,
    }
    setBlocks((blocks) => [
      ...blocks.filter((block) => block.steps.length > 0),
      parseNewBlock({
        step,
        type,
        totalBlocks: blocks.length,
        initialCoordinates: boardCoordinates,
      }),
    ])
  }

  const updateBlockPosition = (blockId: string, newPosition: Coordinates) => {
    setBlocks((blocks) =>
      blocks.map((block) =>
        block.id === blockId
          ? { ...block, graphCoordinates: newPosition }
          : block
      )
    )
  }

  const addNewStepToBlock = (
    blockId: string,
    step: StepType | Step,
    index: number
  ) => {
    setBlocks((blocks) =>
      blocks
        .map((block) =>
          block.id === blockId
            ? {
                ...block,
                steps: insertItemInList<Step>(
                  block.steps,
                  index,
                  typeof step === 'string'
                    ? parseNewStep(step as StepType, block.id)
                    : { ...step, blockId: block.id }
                ),
              }
            : block
        )
        .filter((block) => block.steps.length > 0)
    )
  }

  const removeStepFromBlock = (blockId: string, stepId: string) => {
    setBlocks((blocks) =>
      blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              steps: [...block.steps.filter((step) => step.id !== stepId)],
            }
          : block
      )
    )
  }

  const addTarget = ({
    blockId,
    stepId,
    target,
  }: {
    blockId: string
    stepId: string
    target?: Target
  }) => {
    startBlock && blockId === 'start-block'
      ? setStartBlock({
          ...startBlock,
          steps: [{ ...startBlock.steps[0], target }],
        })
      : setBlocks((blocks) =>
          blocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  steps: [
                    ...block.steps.map((step) =>
                      step.id === stepId ? { ...step, target } : step
                    ),
                  ],
                }
              : block
          )
        )
  }

  const removeTarget = ({
    blockId,
    stepId,
  }: {
    blockId: string
    stepId: string
  }) => {
    setBlocks((blocks) =>
      blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              steps: [
                ...block.steps.map((step) =>
                  step.id === stepId ? { ...step, target: undefined } : step
                ),
              ],
            }
          : block
      )
    )
  }

  return (
    <graphContext.Provider
      value={{
        graphPosition,
        setGraphPosition,
        connectingIds,
        setConnectingIds,
        blocks,
        setBlocks,
        updateBlockPosition,
        addNewStepToBlock,
        addNewBlock,
        removeStepFromBlock,
        addTarget,
        removeTarget,
        startBlock,
        setStartBlock,
      }}
    >
      {children}
    </graphContext.Provider>
  )
}

export const useGraph = () => useContext(graphContext)
