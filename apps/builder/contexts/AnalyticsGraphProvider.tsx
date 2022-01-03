import { Block, PublicTypebot } from 'bot-engine'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'
import { Coordinates } from './GraphContext'

type Position = Coordinates & { scale: number }

const graphPositionDefaultValue = { x: 400, y: 100, scale: 1 }

const graphContext = createContext<{
  typebot?: PublicTypebot
  updateBlockPosition: (blockId: string, newPositon: Coordinates) => void
  graphPosition: Position
  setGraphPosition: Dispatch<SetStateAction<Position>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({
  graphPosition: graphPositionDefaultValue,
})

export const AnalyticsGraphProvider = ({
  children,
  initialTypebot,
}: {
  children: ReactNode
  initialTypebot: PublicTypebot
}) => {
  const [typebot, setTypebot] = useState(initialTypebot)

  const [graphPosition, setGraphPosition] = useState(graphPositionDefaultValue)

  const updateBlocks = (blocks: Block[]) => {
    if (!typebot) return
    setTypebot({
      ...typebot,
      blocks: [...blocks],
    })
  }

  const updateBlockPosition = (blockId: string, newPosition: Coordinates) => {
    if (!typebot) return
    blockId === 'start-block'
      ? setTypebot({
          ...typebot,
          startBlock: {
            ...typebot.startBlock,
            graphCoordinates: newPosition,
          },
        })
      : updateBlocks(
          typebot.blocks.map((block) =>
            block.id === blockId
              ? { ...block, graphCoordinates: newPosition }
              : block
          )
        )
  }

  return (
    <graphContext.Provider
      value={{
        typebot,
        graphPosition,
        setGraphPosition,
        updateBlockPosition,
      }}
    >
      {children}
    </graphContext.Provider>
  )
}

export const useAnalyticsGraph = () => useContext(graphContext)
