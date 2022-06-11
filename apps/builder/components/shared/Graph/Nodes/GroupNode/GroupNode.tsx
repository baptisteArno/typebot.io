import {
  Editable,
  EditableInput,
  EditablePreview,
  IconButton,
  Stack,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { Group } from 'models'
import { useGraph } from 'contexts/GraphContext'
import { useBlockDnd } from 'contexts/GraphDndContext'
import { BlockNodesList } from '../BlockNode/BlockNodesList'
import { isDefined, isNotDefined } from 'utils'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { GroupNodeContextMenu } from './GroupNodeContextMenu'
import { useDebounce } from 'use-debounce'
import { setMultipleRefs } from 'services/utils'
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable'
import { PlayIcon } from 'assets/icons'
import { RightPanel, useEditor } from 'contexts/EditorContext'

type Props = {
  group: Group
  groupIndex: number
}

export const GroupNode = ({ group, groupIndex }: Props) => {
  const {
    connectingIds,
    setConnectingIds,
    previewingEdge,
    groupsCoordinates,
    updateGroupCoordinates,
    isReadOnly,
    focusedGroupId,
    setFocusedGroupId,
    graphPosition,
  } = useGraph()
  const { typebot, updateGroup } = useTypebot()
  const { setMouseOverGroup, mouseOverGroup } = useBlockDnd()
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const { setRightPanel, setStartPreviewAtGroup } = useEditor()
  const isPreviewing =
    previewingEdge?.from.groupId === group.id ||
    (previewingEdge?.to.groupId === group.id &&
      isNotDefined(previewingEdge.to.blockId))
  const isStartGroup =
    isDefined(group.blocks[0]) && group.blocks[0].type === 'start'

  const groupCoordinates = groupsCoordinates[group.id]
  const groupRef = useRef<HTMLDivElement | null>(null)
  const [debouncedGroupPosition] = useDebounce(groupCoordinates, 100)
  useEffect(() => {
    if (!debouncedGroupPosition || isReadOnly) return
    if (
      debouncedGroupPosition?.x === group.graphCoordinates.x &&
      debouncedGroupPosition.y === group.graphCoordinates.y
    )
      return
    updateGroup(groupIndex, { graphCoordinates: debouncedGroupPosition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGroupPosition])

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.groupId === group.id &&
        isNotDefined(connectingIds.target?.groupId)
    )
  }, [connectingIds, group.id])

  const handleTitleSubmit = (title: string) =>
    updateGroup(groupIndex, { title })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleMouseEnter = () => {
    if (isReadOnly) return
    if (mouseOverGroup?.id !== group.id && !isStartGroup)
      setMouseOverGroup({ id: group.id, ref: groupRef })
    if (connectingIds)
      setConnectingIds({ ...connectingIds, target: { groupId: group.id } })
  }

  const handleMouseLeave = () => {
    if (isReadOnly) return
    setMouseOverGroup(undefined)
    if (connectingIds) setConnectingIds({ ...connectingIds, target: undefined })
  }

  const onDrag = (_: DraggableEvent, draggableData: DraggableData) => {
    const { deltaX, deltaY } = draggableData
    updateGroupCoordinates(group.id, {
      x: groupCoordinates.x + deltaX / graphPosition.scale,
      y: groupCoordinates.y + deltaY / graphPosition.scale,
    })
  }

  const onDragStart = () => {
    setFocusedGroupId(group.id)
    setIsMouseDown(true)
  }

  const startPreviewAtThisGroup = () => {
    setStartPreviewAtGroup(group.id)
    setRightPanel(RightPanel.PREVIEW)
  }

  const onDragStop = () => setIsMouseDown(false)
  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <GroupNodeContextMenu groupIndex={groupIndex} />}
      isDisabled={isReadOnly || isStartGroup}
    >
      {(ref, isOpened) => (
        <DraggableCore
          enableUserSelectHack={false}
          onDrag={onDrag}
          onStart={onDragStart}
          onStop={onDragStop}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Stack
            ref={setMultipleRefs([ref, groupRef])}
            data-testid="group"
            p="4"
            rounded="xl"
            bgColor="#ffffff"
            borderWidth="2px"
            borderColor={
              isConnecting || isOpened || isPreviewing ? 'blue.400' : '#ffffff'
            }
            w="300px"
            transition="border 300ms, box-shadow 200ms"
            pos="absolute"
            style={{
              transform: `translate(${groupCoordinates?.x ?? 0}px, ${
                groupCoordinates?.y ?? 0
              }px)`,
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            cursor={isMouseDown ? 'grabbing' : 'pointer'}
            shadow="md"
            _hover={{ shadow: 'lg' }}
            zIndex={focusedGroupId === group.id ? 10 : 1}
          >
            <Editable
              defaultValue={group.title}
              onSubmit={handleTitleSubmit}
              fontWeight="semibold"
              pointerEvents={isReadOnly || isStartGroup ? 'none' : 'auto'}
            >
              <EditablePreview
                _hover={{ bgColor: 'gray.200' }}
                px="1"
                userSelect={'none'}
              />
              <EditableInput
                minW="0"
                px="1"
                onMouseDown={(e) => e.stopPropagation()}
              />
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
            <IconButton
              icon={<PlayIcon />}
              aria-label={'Preview bot from this group'}
              pos="absolute"
              right={2}
              top={0}
              size="sm"
              variant="outline"
              onClick={startPreviewAtThisGroup}
            />
          </Stack>
        </DraggableCore>
      )}
    </ContextMenu>
  )
}
