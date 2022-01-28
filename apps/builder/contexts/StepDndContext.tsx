import { ChoiceItem, DraggableStep, DraggableStepType } from 'models'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

const stepDndContext = createContext<{
  draggedStepType?: DraggableStepType
  setDraggedStepType: Dispatch<SetStateAction<DraggableStepType | undefined>>
  draggedStep?: DraggableStep
  setDraggedStep: Dispatch<SetStateAction<DraggableStep | undefined>>
  draggedChoiceItem?: ChoiceItem
  setDraggedChoiceItem: Dispatch<SetStateAction<ChoiceItem | undefined>>
  mouseOverBlockId?: string
  setMouseOverBlockId: Dispatch<SetStateAction<string | undefined>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export const StepDndContext = ({ children }: { children: ReactNode }) => {
  const [draggedStep, setDraggedStep] = useState<DraggableStep>()
  const [draggedStepType, setDraggedStepType] = useState<
    DraggableStepType | undefined
  >()
  const [draggedChoiceItem, setDraggedChoiceItem] = useState<
    ChoiceItem | undefined
  >()
  const [mouseOverBlockId, setMouseOverBlockId] = useState<string>()

  return (
    <stepDndContext.Provider
      value={{
        draggedStep,
        setDraggedStep,
        draggedStepType,
        setDraggedStepType,
        draggedChoiceItem,
        setDraggedChoiceItem,
        mouseOverBlockId,
        setMouseOverBlockId,
      }}
    >
      {children}
    </stepDndContext.Provider>
  )
}

export const useStepDnd = () => useContext(stepDndContext)
