import {
  Editable,
  EditableInput,
  EditablePreview,
  SlideFade,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { GroupV6 } from '@typebot.io/schemas'
import { BlockNodesList } from '../block/BlockNodesList'
import { isEmpty, isNotDefined } from '@typebot.io/lib'
import { GroupNodeContextMenu } from './GroupNodeContextMenu'
import { ContextMenu } from '@/components/ContextMenu'
import { useDrag } from '@use-gesture/react'
import { GroupFocusToolbar } from './GroupFocusToolbar'
import {
  RightPanel,
  useEditor,
} from '@/features/editor/providers/EditorProvider'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { useBlockDnd } from '@/features/graph/providers/GraphDndProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { groupWidth } from '@/features/graph/constants'
import { useGroupsStore } from '@/features/graph/hooks/useGroupsStore'
import { useShallow } from 'zustand/react/shallow'

type Props = {
  group: GroupV6
  groupIndex: number
}

export const GroupNode = ({ group, groupIndex }: Props) => {
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
  const { typebot, updateGroup, updateGroupsCoordinates } = useTypebot()
  const { setMouseOverGroup, mouseOverGroup } = useBlockDnd()
  const { setRightPanel, setStartPreviewAtGroup } = useEditor()

  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [groupTitle, setGroupTitle] = useState(group.title)

  const isPreviewing =
    previewingBlock?.groupId === group.id ||
    (previewingEdge &&
      (('groupId' in previewingEdge.from &&
        previewingEdge.from.groupId === group.id) ||
        (previewingEdge.to.groupId === group.id &&
          isNotDefined(previewingEdge.to.blockId))))

  const groupRef = useRef<HTMLDivElement | null>(null)
  const isDraggingGraph = useGroupsStore((state) => state.isDraggingGraph)
  const focusedGroups = useGroupsStore(
    useShallow((state) => state.focusedGroups)
  )
  const groupCoordinates = useGroupsStore(
    useShallow((state) =>
      state.groupsCoordinates
        ? state.groupsCoordinates[group.id]
        : group.graphCoordinates
    )
  )
  const { moveFocusedGroups, focusGroup, getGroupsCoordinates } =
    useGroupsStore(
      useShallow((state) => ({
        getGroupsCoordinates: state.getGroupsCoordinates,
        moveFocusedGroups: state.moveFocusedGroups,
        focusGroup: state.focusGroup,
      }))
    )

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
    if (mouseOverGroup?.id !== group.id && groupRef.current)
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
    ({ first, last, delta, event, target }) => {
      event.stopPropagation()
      if (
        (target as HTMLElement)
          .closest('.prevent-group-drag')
          ?.classList.contains('prevent-group-drag')
      )
        return

      if (first) {
        setIsMouseDown(true)
        if (focusedGroups.find((id) => id === group.id) && !event.shiftKey)
          return
        focusGroup(group.id, event.shiftKey)
      }

      moveFocusedGroups({
        x: delta[0] / graphPosition.scale,
        y: delta[1] / graphPosition.scale,
      })

      if (last) {
        const newGroupsCoordinates = getGroupsCoordinates()
        if (!newGroupsCoordinates) return
        updateGroupsCoordinates(newGroupsCoordinates)
        setIsMouseDown(false)
      }
    },
    {
      target: groupRef,
      pointer: { keys: false },
      from: () => [
        groupCoordinates.x * graphPosition.scale,
        groupCoordinates.y * graphPosition.scale,
      ],
    }
  )

  const isFocused = focusedGroups.includes(group.id)

  return (
    <ContextMenu<HTMLDivElement>
      onOpen={() => focusGroup(group.id)}
      renderMenu={() => <GroupNodeContextMenu />}
      isDisabled={isReadOnly}
    >
      {(ref, isContextMenuOpened) => (
        <Stack
          ref={setMultipleRefs([ref, groupRef])}
          id={`group-${group.id}`}
          data-testid="group"
          className="group"
          p="4"
          rounded="xl"
          bg={bg}
          borderWidth="1px"
          borderColor={
            isConnecting || isContextMenuOpened || isPreviewing || isFocused
              ? previewingBorderColor
              : borderColor
          }
          w={groupWidth}
          transition="border 300ms, box-shadow 200ms"
          pos="absolute"
          style={{
            transform: `translate(${groupCoordinates?.x ?? 0}px, ${
              groupCoordinates?.y ?? 0
            }px)`,
            touchAction: 'none',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          cursor={isMouseDown ? 'grabbing' : 'pointer'}
          shadow="md"
          _hover={{ shadow: 'lg' }}
          zIndex={isFocused ? 10 : 1}
          spacing={isEmpty(group.title) ? '0' : '2'}
          pointerEvents={isDraggingGraph ? 'none' : 'auto'}
        >
          <Editable
            value={groupTitle}
            onChange={setGroupTitle}
            onSubmit={handleTitleSubmit}
            fontWeight="semibold"
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
              blocks={group.blocks}
              groupIndex={groupIndex}
              groupRef={ref}
            />
          )}
          {!isReadOnly && focusedGroups.length === 1 && (
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
                groupId={group.id}
                onPlayClick={startPreviewAtThisGroup}
              />
            </SlideFade>
          )}
        </Stack>
      )}
    </ContextMenu>
  )
}
