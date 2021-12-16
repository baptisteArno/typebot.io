import { Step, StepType } from 'bot-engine'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

const dndContext = createContext<{
  draggedStepType?: StepType
  setDraggedStepType: Dispatch<SetStateAction<StepType | undefined>>
  draggedStep?: Step
  setDraggedStep: Dispatch<SetStateAction<Step | undefined>>
}>({
  setDraggedStep: () => console.log("I'm not implemented"),
  setDraggedStepType: () => console.log("I'm not implemented"),
})

export const DndContext = ({ children }: { children: ReactNode }) => {
  const [draggedStep, setDraggedStep] = useState<Step | undefined>()
  const [draggedStepType, setDraggedStepType] = useState<StepType | undefined>()

  return (
    <dndContext.Provider
      value={{
        draggedStep,
        setDraggedStep,
        draggedStepType,
        setDraggedStepType,
      }}
    >
      {children}
    </dndContext.Provider>
  )
}

export const useDnd = () => useContext(dndContext)
