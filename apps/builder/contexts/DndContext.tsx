import { ChoiceItem, DraggableStep, DraggableStepType } from 'models'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'

const dndContext = createContext<{
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

export const DndContext = ({ children }: { children: ReactNode }) => {
  const [draggedStep, setDraggedStep] = useState<DraggableStep>()
  const [draggedStepType, setDraggedStepType] = useState<
    DraggableStepType | undefined
  >()
  const [draggedChoiceItem, setDraggedChoiceItem] = useState<
    ChoiceItem | undefined
  >()
  const [mouseOverBlockId, setMouseOverBlockId] = useState<string>()

  return (
    <dndContext.Provider
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
    </dndContext.Provider>
  )
}

export const useDnd = () => useContext(dndContext)
