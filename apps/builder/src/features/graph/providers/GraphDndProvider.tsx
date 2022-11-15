import { useEventListener } from '@chakra-ui/react'
import { ButtonItem, DraggableBlock, DraggableBlockType } from 'models'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from 'react'
import { Coordinates } from './GraphProvider'

type GroupInfo = {
  id: string
  ref: React.MutableRefObject<HTMLDivElement | null>
}

const graphDndContext = createContext<{
  draggedBlockType?: DraggableBlockType
  setDraggedBlockType: Dispatch<SetStateAction<DraggableBlockType | undefined>>
  draggedBlock?: DraggableBlock
  setDraggedBlock: Dispatch<SetStateAction<DraggableBlock | undefined>>
  draggedItem?: ButtonItem
  setDraggedItem: Dispatch<SetStateAction<ButtonItem | undefined>>
  mouseOverGroup?: GroupInfo
  setMouseOverGroup: Dispatch<SetStateAction<GroupInfo | undefined>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
}>({})

export type NodePosition = { absolute: Coordinates; relative: Coordinates }

export const GraphDndProvider = ({ children }: { children: ReactNode }) => {
  const [draggedBlock, setDraggedBlock] = useState<DraggableBlock>()
  const [draggedBlockType, setDraggedBlockType] = useState<
    DraggableBlockType | undefined
  >()
  const [draggedItem, setDraggedItem] = useState<ButtonItem | undefined>()
  const [mouseOverGroup, setMouseOverGroup] = useState<GroupInfo>()

  return (
    <graphDndContext.Provider
      value={{
        draggedBlock,
        setDraggedBlock,
        draggedBlockType,
        setDraggedBlockType,
        draggedItem,
        setDraggedItem,
        mouseOverGroup,
        setMouseOverGroup,
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
    if (isDisabled || !ref.current) return
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

export const useBlockDnd = () => useContext(graphDndContext)
