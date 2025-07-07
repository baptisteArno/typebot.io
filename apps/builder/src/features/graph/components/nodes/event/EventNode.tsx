import { SlideFade, Stack, useColorModeValue } from '@chakra-ui/react'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { EventNodeContextMenu } from './EventNodeContextMenu'
import { useDebounce } from 'use-debounce'
import { ContextMenu } from '@/components/ContextMenu'
import { useDrag } from '@use-gesture/react'
import { EventFocusToolbar } from './EventFocusToolbar'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import {
  RightPanel,
  useEditor,
} from '@/features/editor/providers/EditorProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useEventsCoordinates } from '@/features/graph/providers/EventsCoordinateProvider'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { Coordinates } from '@/features/graph/types'
import { TEvent } from '@typebot.io/schemas'
import { EventNodeContent } from './EventNodeContent'
import { EventSourceEndpoint } from '../../endpoints/EventSourceEndpoint'
import { eventWidth } from '@/features/graph/constants'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useGroupsStore } from '@/features/graph/hooks/useGroupsStore'

type Props = {
  event: TEvent
  eventIndex: number
}

export const EventNode = ({ event, eventIndex }: Props) => {
  const { updateEventCoordinates } = useEventsCoordinates()

  const handleEventDrag = useCallback(
    (newCoord: Coordinates) => {
      updateEventCoordinates(event.id, newCoord)
    },
    [event.id, updateEventCoordinates]
  )

  return (
    <DraggableEventNode
      event={event}
      eventIndex={eventIndex}
      onEventDrag={handleEventDrag}
    />
  )
}

const NonMemoizedDraggableEventNode = ({
  event,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  eventIndex,
  onEventDrag,
}: Props & { onEventDrag: (newCoord: Coordinates) => void }) => {
  const elementBgColor = useColorModeValue('white', 'gray.900')
  const previewingBorderColor = useColorModeValue('orange.400', 'orange.300')
  const { previewingEdge, isReadOnly, graphPosition } = useGraph()
  const { updateEvent } = useTypebot()
  const { setRightPanel, setStartPreviewAtEvent } = useEditor()

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [currentCoordinates, setCurrentCoordinates] = useState(
    event.graphCoordinates
  )

  const isPreviewing = previewingEdge
    ? 'eventId' in previewingEdge.from
      ? previewingEdge.from.eventId === event.id
      : false
    : false

  const eventRef = useRef<HTMLDivElement | null>(null)
  const [debouncedEventPosition] = useDebounce(currentCoordinates, 100)
  const [isFocused, setIsFocused] = useState(false)
  const isDraggingGraph = useGroupsStore((state) => state.isDraggingGraph)

  useOutsideClick({
    handler: () => setIsFocused(false),
    ref: eventRef,
    capture: true,
    isEnabled: isFocused,
  })

  // When the event is moved from external action (e.g. undo/redo), update the current coordinates
  useEffect(() => {
    setCurrentCoordinates({
      x: event.graphCoordinates.x,
      y: event.graphCoordinates.y,
    })
  }, [event.graphCoordinates.x, event.graphCoordinates.y])

  useEffect(() => {
    if (!currentCoordinates || isReadOnly) return
    if (
      currentCoordinates?.x === event.graphCoordinates.x &&
      currentCoordinates.y === event.graphCoordinates.y
    )
      return
    updateEvent(eventIndex, { graphCoordinates: currentCoordinates })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedEventPosition])

  const startPreviewAtThisEvent = () => {
    setStartPreviewAtEvent(event.id)
    setRightPanel(RightPanel.PREVIEW)
  }

  useDrag(
    ({ first, last, offset: [offsetX, offsetY], event, target }) => {
      event.stopPropagation()
      if (
        (target as HTMLElement)
          .closest('.prevent-event-drag')
          ?.classList.contains('prevent-event-drag')
      )
        return

      if (first) {
        setIsFocused(true)
        setIsMouseDown(true)
      }
      if (last) {
        setIsMouseDown(false)
      }
      const newCoord = {
        x: Number((offsetX / graphPosition.scale).toFixed(2)),
        y: Number((offsetY / graphPosition.scale).toFixed(2)),
      }
      setCurrentCoordinates(newCoord)
      onEventDrag(newCoord)
    },
    {
      target: eventRef,
      pointer: { keys: false },
      from: () => [
        currentCoordinates.x * graphPosition.scale,
        currentCoordinates.y * graphPosition.scale,
      ],
    }
  )

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <EventNodeContextMenu />}
      isDisabled={isReadOnly || event.type === 'start'}
    >
      {(ref, isContextMenuOpened) => (
        <Stack
          ref={setMultipleRefs([ref, eventRef])}
          id={`event-${event.id}`}
          userSelect="none"
          data-testid="event"
          py="2"
          pl="3"
          pr="3"
          w={eventWidth}
          rounded="xl"
          bg={elementBgColor}
          borderWidth="1px"
          fontWeight="semibold"
          borderColor={
            isContextMenuOpened || isPreviewing || isFocused
              ? previewingBorderColor
              : elementBgColor
          }
          transition="border 300ms, box-shadow 200ms"
          pos="absolute"
          style={{
            transform: `translate(${currentCoordinates?.x ?? 0}px, ${
              currentCoordinates?.y ?? 0
            }px)`,
            touchAction: 'none',
          }}
          cursor={isMouseDown ? 'grabbing' : 'pointer'}
          shadow="md"
          _hover={{ shadow: 'lg' }}
          zIndex={isFocused ? 10 : 1}
          pointerEvents={isDraggingGraph ? 'none' : 'auto'}
        >
          <EventNodeContent event={event} />
          <EventSourceEndpoint
            source={{
              eventId: event.id,
            }}
            pos="absolute"
            right="-19px"
            bottom="4px"
            isHidden={false}
          />
          {!isReadOnly && (
            <SlideFade
              in={isFocused}
              style={{
                position: 'absolute',
                top: '-45px',
                right: 0,
              }}
              unmountOnExit
            >
              <EventFocusToolbar
                eventId={event.id}
                onPlayClick={startPreviewAtThisEvent}
                onDeleteClick={event.type !== 'start' ? () => {} : undefined}
              />
            </SlideFade>
          )}
        </Stack>
      )}
    </ContextMenu>
  )
}

export const DraggableEventNode = memo(NonMemoizedDraggableEventNode)
