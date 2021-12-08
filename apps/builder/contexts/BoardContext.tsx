import { BrowserJsPlumbInstance } from '@jsplumb/browser-ui'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'
import { Step } from 'bot-engine'

type Position = { x: number; y: number; scale: number }

const graphPositionDefaultValue = { x: 400, y: 100, scale: 1 }

const graphContext = createContext<{
  position: Position
  setGraphPosition: Dispatch<SetStateAction<Position>>
  plumbInstance?: BrowserJsPlumbInstance
  setPlumbInstance: Dispatch<SetStateAction<BrowserJsPlumbInstance | undefined>>
  draggedStep?: Step
  setDraggedStep: Dispatch<SetStateAction<Step | undefined>>
}>({
  position: graphPositionDefaultValue,
  setGraphPosition: () => {
    console.log("I'm not instantiated")
  },
  setPlumbInstance: () => {
    console.log("I'm not instantiated")
  },
  setDraggedStep: () => {
    console.log("I'm not instantiated")
  },
})

export const GraphProvider = ({ children }: { children: ReactNode }) => {
  const [graphPosition, setGraphPosition] = useState(graphPositionDefaultValue)
  const [plumbInstance, setPlumbInstance] = useState<
    BrowserJsPlumbInstance | undefined
  >()
  const [draggedStep, setDraggedStep] = useState<Step | undefined>()

  return (
    <graphContext.Provider
      value={{
        position: graphPosition,
        setGraphPosition,
        plumbInstance,
        setPlumbInstance,
        draggedStep,
        setDraggedStep,
      }}
    >
      {children}
    </graphContext.Provider>
  )
}

export const useGraph = () => useContext(graphContext)
