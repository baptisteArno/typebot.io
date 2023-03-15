import { EyeOffIcon, GripIcon, EyeIcon } from '@/components/icons'
import { Stack, Portal, Flex, HStack, IconButton } from '@chakra-ui/react'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { Text } from '@chakra-ui/react'
import { ResultHeaderCell } from '@typebot.io/schemas'
import { useState } from 'react'
import { CSS } from '@dnd-kit/utilities'
import { HeaderIcon } from '../HeaderIcon'

type Props = {
  resultHeader: ResultHeaderCell[]
  columnVisibility: { [key: string]: boolean }
  columnOrder: string[]
  onColumnOrderChange: (columnOrder: string[]) => void
  setColumnVisibility: (columnVisibility: { [key: string]: boolean }) => void
}

export const ColumnSettings = ({
  resultHeader,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  onColumnOrderChange,
}: Props) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null)

  const onEyeClick = (id: string) => () => {
    columnVisibility[id] === false
      ? setColumnVisibility({ ...columnVisibility, [id]: true })
      : setColumnVisibility({ ...columnVisibility, [id]: false })
  }
  const sortedHeader = resultHeader.sort(
    (a, b) => columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id)
  )
  const hiddenHeaders = resultHeader.filter(
    (header) => columnVisibility[header.id] === false
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setDraggingColumnId(active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id as string)
      const newIndex = columnOrder.indexOf(over?.id as string)
      if (newIndex === -1 || oldIndex === -1) return
      const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex)
      onColumnOrderChange(newColumnOrder)
    }
  }

  return (
    <Stack>
      <Text fontWeight="semibold" fontSize="sm">
        Shown in table:
      </Text>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columnOrder}
          strategy={verticalListSortingStrategy}
        >
          {sortedHeader.map((header) => (
            <SortableColumns
              key={header.id}
              header={header}
              onEyeClick={onEyeClick}
              hiddenHeaders={hiddenHeaders}
            />
          ))}
        </SortableContext>
        <Portal>
          <DragOverlay dropAnimation={{ duration: 0 }}>
            {draggingColumnId ? <Flex /> : null}
          </DragOverlay>
        </Portal>
      </DndContext>
    </Stack>
  )
}

const SortableColumns = ({
  header,
  hiddenHeaders,
  onEyeClick,
}: {
  header: ResultHeaderCell
  hiddenHeaders: ResultHeaderCell[]
  onEyeClick: (key: string) => () => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isHidden = hiddenHeaders.some(
    (hiddenHeader) => hiddenHeader.id === header.id
  )

  return (
    <Flex
      justify="space-between"
      ref={setNodeRef}
      style={style}
      opacity={isDragging || isHidden ? 0.5 : 1}
      {...attributes}
    >
      <HStack overflow="hidden">
        <IconButton
          size="sm"
          cursor="grab"
          icon={<GripIcon transform="rotate(90deg)" />}
          aria-label={'Drag'}
          variant="ghost"
          {...listeners}
        />
        <HeaderIcon header={header} />
        <Text noOfLines={1}>{header.label}</Text>
      </HStack>
      <IconButton
        icon={isHidden ? <EyeOffIcon /> : <EyeIcon />}
        size="sm"
        aria-label={'Hide column'}
        onClick={onEyeClick(header.id)}
      />
    </Flex>
  )
}
