import {
  Editable,
  EditableInput,
  EditablePreview,
  IconButton,
  Stack,
} from '@chakra-ui/react'
import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Group } from 'models'
import {
  Coordinates,
  useGraph,
  useGroupsCoordinates,
  useBlockDnd,
} from '../../../providers'
import { BlockNodesList } from '../BlockNode/BlockNodesList'
import { isDefined, isNotDefined } from 'utils'
import { useTypebot, RightPanel, useEditor } from '@/features/editor'
import { GroupNodeContextMenu } from './GroupNodeContextMenu'
import { PlayIcon } from '@/components/icons'
import { useDebounce } from 'use-debounce'
import { ContextMenu } from '@/components/ContextMenu'
import { setMultipleRefs } from '@/utils/helpers'
import { useDrag } from '@use-gesture/react'

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

const DraggableGroupNode = memo(
  ({
    group,
    groupIndex,
    onGroupDrag,
  }: Props & { onGroupDrag: (newCoord: Coordinates) => void }) => {
    const {
      connectingIds,
      setConnectingIds,
      previewingEdge,
      isReadOnly,
      focusedGroupId,
      setFocusedGroupId,
      graphPosition,
    } = useGraph()
    const { typebot, updateGroup } = useTypebot()
    const { setMouseOverGroup, mouseOverGroup } = useBlockDnd()
    const { setRightPanel, setStartPreviewAtGroup } = useEditor()

    const [isMouseDown, setIsMouseDown] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [currentCoordinates, setCurrentCoordinates] = useState(
      group.graphCoordinates
    )
    const [groupTitle, setGroupTitle] = useState(group.title)

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

    const isPreviewing =
      previewingEdge?.from.groupId === group.id ||
      (previewingEdge?.to.groupId === group.id &&
        isNotDefined(previewingEdge.to.blockId))
    const isStartGroup =
      isDefined(group.blocks[0]) && group.blocks[0].type === 'start'

    const groupRef = useRef<HTMLDivElement | null>(null)
    const [debouncedGroupPosition] = useDebounce(currentCoordinates, 100)
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
      title.length > 0 ? updateGroup(groupIndex, { title }) : undefined

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
      if (connectingIds)
        setConnectingIds({ ...connectingIds, target: undefined })
    }

    const startPreviewAtThisGroup = () => {
      setStartPreviewAtGroup(group.id)
      setRightPanel(RightPanel.PREVIEW)
    }

    useDrag(
      ({ first, last, offset: [offsetX, offsetY], event, target }) => {
        event.stopPropagation()
        if ((target as HTMLElement).classList.contains('prevent-group-drag'))
          return
        if (first) {
          setFocusedGroupId(group.id)
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
        {(ref, isOpened) => (
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
              transform: `translate(${currentCoordinates?.x ?? 0}px, ${
                currentCoordinates?.y ?? 0
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
              value={groupTitle}
              onChange={setGroupTitle}
              onSubmit={handleTitleSubmit}
              fontWeight="semibold"
              pointerEvents={isReadOnly || isStartGroup ? 'none' : 'auto'}
              pr="8"
            >
              <EditablePreview
                _hover={{ bgColor: 'gray.200' }}
                px="1"
                userSelect={'none'}
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
        )}
      </ContextMenu>
    )
  }
)
