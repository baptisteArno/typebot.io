import { useEventListener } from '@chakra-ui/react'
import { ButtonItem, DraggableStep, DraggableStepType } from 'models'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from 'react'
import { Coordinates } from './GraphContext'

type BlockInfo = {
  id: string
  ref: React.MutableRefObject<HTMLDivElement | null>
}

const graphDndContext = createContext<{
  draggedStepType?: DraggableStepType
  setDraggedStepType: Dispatch<SetStateAction<DraggableStepType | undefined>>
  draggedStep?: DraggableStep
  setDraggedStep: Dispatch<SetStateAction<DraggableStep | undefined>>
  draggedItem?: ButtonItem
  setDraggedItem: Dispatch<SetStateAction<ButtonItem | undefined>>
  mouseOverBlock?: BlockInfo
  setMouseOverBlock: Dispatch<SetStateAction<BlockInfo | undefined>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export type NodePosition = { absolute: Coordinates; relative: Coordinates }

export const GraphDndContext = ({ children }: { children: ReactNode }) => {
  const [draggedStep, setDraggedStep] = useState<DraggableStep>()
  const [draggedStepType, setDraggedStepType] = useState<
    DraggableStepType | undefined
  >()
  const [draggedItem, setDraggedItem] = useState<ButtonItem | undefined>()
  const [mouseOverBlock, setMouseOverBlock] = useState<BlockInfo>()

  return (
    <graphDndContext.Provider
      value={{
        draggedStep,
        setDraggedStep,
        draggedStepType,
        setDraggedStepType,
        draggedItem,
        setDraggedItem,
        mouseOverBlock,
        setMouseOverBlock,
      }}
    >
      {children}
    </graphDndContext.Provider>
  )
}

export const useDragDistance = ({
  ref,
  onDrag,
  distanceTolerance = 20,
  isDisabled = false,
}: {
  ref: React.MutableRefObject<HTMLDivElement | null>
  onDrag: (position: { absolute: Coordinates; relative: Coordinates }) => void
  distanceTolerance?: number
  isDisabled: boolean
}) => {
  const mouseDownPosition = useRef<{
    absolute: Coordinates
    relative: Coordinates
  }>()

  const handleMouseUp = () => {
    if (mouseDownPosition) mouseDownPosition.current = undefined
  }
  useEventListener('mouseup', handleMouseUp)

  const handleMouseDown = (e: MouseEvent) => {


    const target = e.target as HTMLInputElement
    if (target.inputMode = "text") return
    if (isDisabled || !ref.current) return
    if (ref?.current?.dataset && ref.current.dataset['testid'] !== 'item') e.preventDefault()
    e.stopPropagation()
    const { top, left } = ref.current.getBoundingClientRect()
    mouseDownPosition.current = {
      absolute: { x: e.clientX, y: e.clientY },
      relative: {
        x: e.clientX - left,
        y: e.clientY - top,
      },
    }
  }
  useEventListener('mousedown', handleMouseDown, ref.current)

  const handleMouseMove = (e: MouseEvent) => {
    if (!mouseDownPosition.current) return
    const { clientX, clientY } = e
    if (
      Math.abs(mouseDownPosition.current.absolute.x - clientX) >
      distanceTolerance ||
      Math.abs(mouseDownPosition.current.absolute.y - clientY) >
      distanceTolerance
    ) {
      e.preventDefault()
      onDrag(mouseDownPosition.current)
    }
  }
  useEventListener('mousemove', handleMouseMove)
}

export const computeNearestPlaceholderIndex = (
  offsetY: number,
  placeholderRefs: React.MutableRefObject<HTMLDivElement[]>
) => {
  const { closestIndex } = placeholderRefs.current.reduce(
    (prev, elem, index) => {
      const elementTop = elem.getBoundingClientRect().top
      const mouseDistanceFromPlaceholder = Math.abs(offsetY - elementTop)
      return mouseDistanceFromPlaceholder < prev.value
        ? { closestIndex: index, value: mouseDistanceFromPlaceholder }
        : prev
    },
    { closestIndex: 0, value: 999999999999 }
  )
  return closestIndex
}

export const useStepDnd = () => useContext(graphDndContext)
