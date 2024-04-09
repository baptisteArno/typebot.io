import {
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import {
  BubbleBlock,
  BubbleBlockContent,
  Block,
  BlockWithOptions,
  TextBubbleBlock,
  BlockV6,
} from '@typebot.io/schemas'
import { isDefined } from '@typebot.io/lib'
import {
  isInputBlock,
  isBubbleBlock,
  isTextBubbleBlock,
} from '@typebot.io/schemas/helpers'
import { BlockNodeContent } from './BlockNodeContent'
import { BlockSettings, SettingsPopoverContent } from './SettingsPopoverContent'
import { BlockNodeContextMenu } from './BlockNodeContextMenu'
import { BlockSourceEndpoint } from '../../endpoints/BlockSourceEndpoint'
import { useRouter } from 'next/router'
import { MediaBubblePopoverContent } from './MediaBubblePopoverContent'
import { ContextMenu } from '@/components/ContextMenu'
import { TextBubbleEditor } from '@/features/blocks/bubbles/textBubble/components/TextBubbleEditor'
import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  NodePosition,
  useBlockDnd,
  useDragDistance,
} from '@/features/graph/providers/GraphDndProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { ParentModalProvider } from '@/features/graph/providers/ParentModalProvider'
import { hasDefaultConnector } from '@/features/typebot/helpers/hasDefaultConnector'
import { setMultipleRefs } from '@/helpers/setMultipleRefs'
import { TargetEndpoint } from '../../endpoints/TargetEndpoint'
import { SettingsModal } from './SettingsModal'
import { TElement } from '@udecode/plate-common'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { useGroupsStore } from '@/features/graph/hooks/useGroupsStore'
import { TurnableIntoParam } from '@typebot.io/forge'
import { ZodError, ZodObject } from 'zod'
import { toast } from 'sonner'
import { fromZodError } from 'zod-validation-error'

export const BlockNode = ({
  block,
  isConnectable,
  indices,
  onMouseDown,
}: {
  block: BlockV6
  isConnectable: boolean
  indices: { blockIndex: number; groupIndex: number }
  onMouseDown?: (blockNodePosition: NodePosition, block: BlockV6) => void
}) => {
  const bg = useColorModeValue('gray.50', 'gray.850')
  const previewingBorderColor = useColorModeValue('blue.400', 'blue.300')
  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const { pathname, query } = useRouter()
  const {
    setConnectingIds,
    connectingIds,
    openedBlockId,
    setOpenedBlockId,
    setFocusedGroupId,
    previewingEdge,
    isReadOnly,
    isAnalytics,
    previewingBlock,
  } = useGraph()
  const { mouseOverBlock, setMouseOverBlock } = useBlockDnd()
  const { typebot, updateBlock } = useTypebot()
  const [isConnecting, setIsConnecting] = useState(false)
  const blockRef = useRef<HTMLDivElement | null>(null)

  const isPreviewing =
    isConnecting ||
    previewingEdge?.to.blockId === block.id ||
    previewingBlock?.id === block.id

  const groupId = typebot?.groups.at(indices.groupIndex)?.id

  const isDraggingGraph = useGroupsStore((state) => state.isDraggingGraph)

  const onDrag = (position: NodePosition) => {
    if (!onMouseDown) return
    onMouseDown(position, block)
  }

  useDragDistance({
    ref: blockRef,
    onDrag,
    isDisabled: !onMouseDown,
    deps: [openedBlockId],
  })

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure()

  useEffect(() => {
    if (query.blockId?.toString() === block.id) setOpenedBlockId(block.id)
  }, [block.id, query, setOpenedBlockId])

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.groupId === groupId &&
        connectingIds?.target?.blockId === block.id
    )
  }, [connectingIds, block.id, groupId])

  const handleModalClose = () => {
    updateBlock(indices, { ...block })
    onModalClose()
  }

  const handleMouseEnter = () => {
    if (isReadOnly) return
    if (mouseOverBlock?.id !== block.id && blockRef.current)
      setMouseOverBlock({ id: block.id, element: blockRef.current })
    if (connectingIds && groupId)
      setConnectingIds({
        ...connectingIds,
        target: { groupId, blockId: block.id },
      })
  }

  const handleMouseLeave = () => {
    if (mouseOverBlock) setMouseOverBlock(undefined)
    if (connectingIds?.target)
      setConnectingIds({
        ...connectingIds,
        target: { ...connectingIds.target, blockId: undefined },
      })
  }

  const handleCloseEditor = () => {
    setOpenedBlockId(undefined)
  }

  const handleTextEditorChange = (content: TElement[]) => {
    const updatedBlock = { ...block, content: { richText: content } }
    updateBlock(indices, updatedBlock)
  }

  const handleClick = (e: React.MouseEvent) => {
    setFocusedGroupId(groupId)
    e.stopPropagation()
    setOpenedBlockId(block.id)
  }

  const handleExpandClick = () => {
    setOpenedBlockId(undefined)
    onModalOpen()
  }

  const handleBlockUpdate = (updates: Partial<Block>) =>
    updateBlock(indices, { ...block, ...updates })

  const handleContentChange = (content: BubbleBlockContent) =>
    updateBlock(indices, { ...block, content } as Block)

  useEffect(() => {
    if (!blockRef.current) return
    const blockElement = blockRef.current
    blockElement.addEventListener('pointerdown', (e) => e.stopPropagation())

    return () => {
      blockElement.removeEventListener('pointerdown', (e) =>
        e.stopPropagation()
      )
    }
  }, [])

  const convertBlock = (
    turnIntoParams: TurnableIntoParam,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    targetBlockSchema: ZodObject<any>
  ) => {
    if (!('options' in block) || !block.options) return

    const convertedBlockOptions = turnIntoParams.transform
      ? turnIntoParams.transform(block.options)
      : block.options
    try {
      updateBlock(
        indices,
        targetBlockSchema.parse({
          ...block,
          type: turnIntoParams.blockId,
          options: {
            ...convertedBlockOptions,
            credentialsId: undefined,
          },
        } as Block)
      )
      setOpenedBlockId(block.id)
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error)
        console.error(validationError)
        toast.error('Could not convert block', {
          description: validationError.toString(),
        })
      } else {
        toast.error('An error occured while converting the block')
      }
    }
  }

  const hasIcomingEdge = typebot?.edges.some((edge) => {
    return edge.to.blockId === block.id
  })

  return openedBlockId === block.id && isTextBubbleBlock(block) ? (
    <TextBubbleEditor
      id={block.id}
      initialValue={block.content?.richText ?? []}
      onChange={handleTextEditorChange}
      onClose={handleCloseEditor}
    />
  ) : (
    <ContextMenu<HTMLDivElement>
      renderMenu={({ onClose }) => (
        <BlockNodeContextMenu
          indices={indices}
          block={block}
          onTurnIntoClick={(params, schema) => {
            convertBlock(params, schema)
            onClose()
          }}
        />
      )}
    >
      {(ref, isContextMenuOpened) => (
        <Popover
          placement="left"
          isLazy
          isOpen={openedBlockId === block.id}
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Flex
              pos="relative"
              ref={setMultipleRefs([ref, blockRef])}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              data-testid={`block ${block.id}`}
              w="full"
              className="prevent-group-drag"
              pointerEvents={isAnalytics || isDraggingGraph ? 'none' : 'auto'}
            >
              <HStack
                flex="1"
                userSelect="none"
                p="3"
                borderWidth={
                  isContextMenuOpened || isPreviewing ? '2px' : '1px'
                }
                borderColor={
                  isContextMenuOpened || isPreviewing
                    ? previewingBorderColor
                    : borderColor
                }
                margin={isContextMenuOpened || isPreviewing ? '-1px' : 0}
                rounded="lg"
                cursor={'pointer'}
                bg={bg}
                align="flex-start"
                w="full"
                transition="border-color 0.2s"
              >
                <BlockIcon type={block.type} mt=".25rem" />
                {typebot?.groups.at(indices.groupIndex)?.id && (
                  <BlockNodeContent
                    block={block}
                    indices={indices}
                    groupId={
                      typebot.groups.at(indices.groupIndex)?.id as string
                    }
                  />
                )}
                {(hasIcomingEdge || isDefined(connectingIds)) && (
                  <TargetEndpoint
                    pos="absolute"
                    left="-34px"
                    top="16px"
                    blockId={block.id}
                    groupId={groupId}
                  />
                )}
                {(isConnectable ||
                  (pathname.endsWith('analytics') && isInputBlock(block))) &&
                  hasDefaultConnector(block) &&
                  groupId &&
                  block.type !== LogicBlockType.JUMP && (
                    <BlockSourceEndpoint
                      source={{
                        blockId: block.id,
                      }}
                      groupId={groupId}
                      pos="absolute"
                      right="-34px"
                      bottom="10px"
                      isHidden={!isConnectable}
                    />
                  )}
              </HStack>
            </Flex>
          </PopoverTrigger>
          {hasSettingsPopover(block) && (
            <>
              <SettingsPopoverContent
                block={block}
                groupId={groupId}
                onExpandClick={handleExpandClick}
                onBlockChange={handleBlockUpdate}
              />
              <ParentModalProvider>
                <SettingsModal isOpen={isModalOpen} onClose={handleModalClose}>
                  <BlockSettings
                    block={block}
                    groupId={groupId}
                    onBlockChange={handleBlockUpdate}
                  />
                </SettingsModal>
              </ParentModalProvider>
            </>
          )}
          {typebot && isMediaBubbleBlock(block) && (
            <MediaBubblePopoverContent
              uploadFileProps={{
                workspaceId: typebot.workspaceId,
                typebotId: typebot.id,
                blockId: block.id,
              }}
              block={block}
              onContentChange={handleContentChange}
            />
          )}
        </Popover>
      )}
    </ContextMenu>
  )
}

const hasSettingsPopover = (block: BlockV6): block is BlockWithOptions =>
  !isBubbleBlock(block) && block.type !== LogicBlockType.CONDITION

const isMediaBubbleBlock = (
  block: BlockV6
): block is Exclude<BubbleBlock, TextBubbleBlock> =>
  isBubbleBlock(block) && !isTextBubbleBlock(block)
