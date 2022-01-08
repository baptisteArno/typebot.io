import { BubbleStep, BubbleStepType, InputStep, InputStepType } from 'models'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

export type DraggableStep = BubbleStep | InputStep
export type DraggableStepType = BubbleStepType | InputStepType

const dndContext = createContext<{
  draggedStepType?: DraggableStepType
  setDraggedStepType: Dispatch<SetStateAction<DraggableStepType | undefined>>
  draggedStep?: DraggableStep
  setDraggedStep: Dispatch<SetStateAction<DraggableStep | undefined>>
}>({
  setDraggedStep: () => console.log("I'm not implemented"),
  setDraggedStepType: () => console.log("I'm not implemented"),
})

export const DndContext = ({ children }: { children: ReactNode }) => {
  const [draggedStep, setDraggedStep] = useState<DraggableStep | undefined>()
  const [draggedStepType, setDraggedStepType] = useState<
    DraggableStepType | undefined
  >()

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
