import {
  Editable,
  EditableInput,
  EditablePreview,
  SlideFade,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Group } from '@typebot.io/schemas'
import { BlockNodesList } from '../block/BlockNodesList'
import { isDefined, isEmpty, isNotDefined } from '@typebot.io/lib'
import { GroupNodeContextMenu } from './GroupNodeContextMenu'
import { useDebounce } from 'use-debounce'
import { ContextMenu } from '@/components/ContextMenu'
import { useDrag } from '@use-gesture/react'
import { GroupFocusToolbar } from './GroupFocusToolbar'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import {
  RightPanel,
  useEditor,
} from '@/features/editor/providers/EditorProvider'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useBlockDnd } from '@/features/graph/providers/GraphDndProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { useGroupsCoordinates } from '@/features/graph/providers/GroupsCoordinateProvider'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { Coordinates } from '@/features/graph/types'

type Props = {
  group: Group
  groupIndex: number
}

export const GroupNode = ({ group, groupIndex }: Props) => {
  const { updateGroupCoordinates } = useGroupsCoordinates()

  const handleGroupDrag = useCallback(
    (newCoord: Coordinates) => {
      updateGroupCoordinates(group.id, newCoord)
    },
    [group.id, updateGroupCoordinates]
  )

  return (
    <DraggableGroupNode
      group={group}
      groupIndex={groupIndex}
      onGroupDrag={handleGroupDrag}
    />
  )
}

const NonMemoizedDraggableGroupNode = ({
  group,
  groupIndex,
  onGroupDrag,
}: Props & { onGroupDrag: (newCoord: Coordinates) => void }) => {
  const bg = useColorModeValue('white', 'gray.900')
  const previewingBorderColor = useColorModeValue('blue.400', 'blue.300')
  const borderColor = useColorModeValue('white', 'gray.800')
  const editableHoverBg = useColorModeValue('gray.100', 'gray.700')
  const {
    connectingIds,
    setConnectingIds,
    previewingEdge,
    previewingBlock,
    isReadOnly,
    graphPosition,
  } = useGraph()
  const { typebot, updateGroup, deleteGroup, duplicateGroup } = useTypebot()
  const { setMouseOverGroup, mouseOverGroup } = useBlockDnd()
  const { setRightPanel, setStartPreviewAtGroup } = useEditor()

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [currentCoordinates, setCurrentCoordinates] = useState(
    group.graphCoordinates
  )
  const [groupTitle, setGroupTitle] = useState(group.title)

  const isPreviewing =
    previewingBlock?.groupId === group.id ||
    previewingEdge?.from.groupId === group.id ||
    (previewingEdge?.to.groupId === group.id &&
      isNotDefined(previewingEdge.to.blockId))

  const isStartGroup =
    isDefined(group.blocks[0]) && group.blocks[0].type === 'start'

  const groupRef = useRef<HTMLDivElement | null>(null)
  const [debouncedGroupPosition] = useDebounce(currentCoordinates, 100)
  const [isFocused, setIsFocused] = useState(false)

  useOutsideClick({
    handler: () => setIsFocused(false),
    ref: groupRef,
    capture: true,
    isEnabled: isFocused,
  })

  // When the group is moved from external action (e.g. undo/redo), update the current coordinates
  useEffect(() => {
    setCurrentCoordinates({
      x: group.graphCoordinates.x,
      y: group.graphCoordinates.y,
    })
  }, [group.graphCoordinates.x, group.graphCoordinates.y])

  // Same for group title
  useEffect(() => {
    setGroupTitle(group.title)
  }, [group.title])

  useEffect(() => {
    if (!currentCoordinates || isReadOnly) return
    if (
      currentCoordinates?.x === group.graphCoordinates.x &&
      currentCoordinates.y === group.graphCoordinates.y
    )
      return
    updateGroup(groupIndex, { graphCoordinates: currentCoordinates })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGroupPosition])

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.groupId === group.id &&
        isNotDefined(connectingIds.target?.blockId)
    )
  }, [connectingIds, group.id])

  const handleTitleSubmit = (title: string) =>
    updateGroup(groupIndex, { title })

  const handleMouseEnter = () => {
    if (isReadOnly) return
    if (mouseOverGroup?.id !== group.id && !isStartGroup && groupRef.current)
      setMouseOverGroup({ id: group.id, element: groupRef.current })
    if (connectingIds)
      setConnectingIds({ ...connectingIds, target: { groupId: group.id } })
  }

  const handleMouseLeave = () => {
    if (isReadOnly) return
    setMouseOverGroup(undefined)
    if (connectingIds) setConnectingIds({ ...connectingIds, target: undefined })
  }

  const startPreviewAtThisGroup = () => {
    setStartPreviewAtGroup(group.id)
    setRightPanel(RightPanel.PREVIEW)
  }

  useDrag(
    ({ first, last, offset: [offsetX, offsetY], event, target }) => {
      event.stopPropagation()
      if (
        (target as HTMLElement)
          .closest('.prevent-group-drag')
          ?.classList.contains('prevent-group-drag')
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
        x: offsetX / graphPosition.scale,
        y: offsetY / graphPosition.scale,
      }
      setCurrentCoordinates(newCoord)
      onGroupDrag(newCoord)
    },
    {
      target: groupRef,
      pointer: { keys: false },
      from: () => [
        currentCoordinates.x * graphPosition.scale,
        currentCoordinates.y * graphPosition.scale,
      ],
    }
  )

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <GroupNodeContextMenu groupIndex={groupIndex} />}
      isDisabled={isReadOnly || isStartGroup}
    >
      {(ref, isContextMenuOpened) => (
        <Stack
          ref={setMultipleRefs([ref, groupRef])}
          id={`group-${group.id}`}
          data-testid="group"
          p="4"
          rounded="xl"
          bg={bg}
          borderWidth="1px"
          borderColor={
            isConnecting || isContextMenuOpened || isPreviewing || isFocused
              ? previewingBorderColor
              : borderColor
          }
          w="300px"
          transition="border 300ms, box-shadow 200ms"
          pos="absolute"
          style={{
            transform: `translate(${currentCoordinates?.x ?? 0}px, ${
              currentCoordinates?.y ?? 0
            }px)`,
            touchAction: 'none',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          cursor={isMouseDown ? 'grabbing' : 'pointer'}
          shadow="md"
          _hover={{ shadow: 'lg' }}
          zIndex={isFocused ? 10 : 1}
        >
          <Editable
            value={groupTitle}
            onChange={setGroupTitle}
            onSubmit={handleTitleSubmit}
            fontWeight="semibold"
            pointerEvents={isReadOnly || isStartGroup ? 'none' : 'auto'}
            pr="8"
          >
            <EditablePreview
              _hover={{
                bg: editableHoverBg,
              }}
              px="1"
              userSelect={'none'}
              style={
                isEmpty(groupTitle)
                  ? {
                      display: 'block',
                      position: 'absolute',
                      top: '10px',
                      width: '50px',
                    }
                  : undefined
              }
            />
            <EditableInput minW="0" px="1" className="prevent-group-drag" />
          </Editable>
          {typebot && (
            <BlockNodesList
              groupId={group.id}
              blocks={group.blocks}
              groupIndex={groupIndex}
              groupRef={ref}
              isStartGroup={isStartGroup}
            />
          )}
          {!isReadOnly && (
            <SlideFade
              in={isFocused}
              style={{
                position: 'absolute',
                top: '-50px',
                right: 0,
              }}
              unmountOnExit
            >
              <GroupFocusToolbar
                onPlayClick={startPreviewAtThisGroup}
                onDuplicateClick={() => {
                  setIsFocused(false)
                  duplicateGroup(groupIndex)
                }}
                onDeleteClick={() => deleteGroup(groupIndex)}
              />
            </SlideFade>
          )}
        </Stack>
      )}
    </ContextMenu>
  )
}

export const DraggableGroupNode = memo(NonMemoizedDraggableGroupNode)
