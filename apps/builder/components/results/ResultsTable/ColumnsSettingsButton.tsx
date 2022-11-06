import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverBody,
  Stack,
  IconButton,
  Flex,
  HStack,
  Text,
  Portal,
} from '@chakra-ui/react'
import { ToolIcon, EyeIcon, EyeOffIcon, GripIcon } from 'assets/icons'
import { ResultHeaderCell } from 'models'
import React, { forwardRef, useState } from 'react'
import { isNotDefined } from 'utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { HeaderIcon } from 'services/typebots/results'

type Props = {
  resultHeader: ResultHeaderCell[]
  columnVisibility: { [key: string]: boolean }
  columnOrder: string[]
  onColumnOrderChange: (columnOrder: string[]) => void
  setColumnVisibility: (columnVisibility: { [key: string]: boolean }) => void
}

export const ColumnSettingsButton = ({
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
  const visibleHeaders = resultHeader
    .filter(
      (header) =>
        isNotDefined(columnVisibility[header.id]) || columnVisibility[header.id]
    )
    .sort((a, b) => columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id))
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
      onColumnOrderChange
      const oldIndex = columnOrder.indexOf(active.id as string)
      const newIndex = columnOrder.indexOf(over?.id as string)
      const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex)
      onColumnOrderChange(newColumnOrder)
    }
  }

  return (
    <Popover isLazy placement="bottom-end">
      <PopoverTrigger>
        <Button leftIcon={<ToolIcon />}>Columns</Button>
      </PopoverTrigger>
      <PopoverContent w="400px">
        <PopoverBody
          as={Stack}
          spacing="4"
          p="4"
          maxH="450px"
          overflowY="scroll"
        >
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
                {visibleHeaders.map((header) => (
                  <SortableColumns
                    key={header.id}
                    header={header}
                    onEyeClick={onEyeClick}
                  />
                ))}
              </SortableContext>
              <Portal>
                <DragOverlay dropAnimation={{ duration: 0 }}>
                  {draggingColumnId ? <SortableColumnOverlay /> : null}
                </DragOverlay>
              </Portal>
            </DndContext>
          </Stack>
          {hiddenHeaders.length > 0 && (
            <Stack>
              <Text fontWeight="semibold" fontSize="sm">
                Hidden in table:
              </Text>
              {hiddenHeaders.map((header) => (
                <Flex key={header.id} justify="space-between">
                  <HStack>
                    <HeaderIcon header={header} />
                    <Text>{header.label}</Text>
                  </HStack>
                  <IconButton
                    icon={<EyeOffIcon />}
                    size="sm"
                    aria-label={'Hide column'}
                    onClick={onEyeClick(header.id)}
                  />
                </Flex>
              ))}
            </Stack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

const SortableColumns = ({
  header,
  onEyeClick,
}: {
  header: ResultHeaderCell
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

  return (
    <Flex
      justify="space-between"
      ref={setNodeRef}
      style={style}
      opacity={isDragging ? 0.5 : 1}
      {...attributes}
    >
      <HStack>
        <IconButton
          size="sm"
          cursor="grab"
          icon={<GripIcon transform="rotate(90deg)" />}
          aria-label={'Drag'}
          variant="ghost"
          {...listeners}
        />
        <HeaderIcon header={header} />
        <Text>{header.label}</Text>
      </HStack>
      <IconButton
        icon={<EyeIcon />}
        size="sm"
        aria-label={'Hide column'}
        onClick={onEyeClick(header.id)}
      />
    </Flex>
  )
}

const SortableColumnOverlay = forwardRef(
  (_, ref: React.LegacyRef<HTMLDivElement>) => {
    return <HStack ref={ref}></HStack>
  }
)
