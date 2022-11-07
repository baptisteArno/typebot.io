import {
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import {
  BubbleBlock,
  BubbleBlockContent,
  ConditionBlock,
  DraggableBlock,
  Block,
  BlockWithOptions,
  TextBubbleContent,
  TextBubbleBlock,
} from 'models'
import { useGraph } from 'contexts/GraphContext'
import { BlockIcon } from 'components/editor/BlocksSideBar/BlockIcon'
import { isBubbleBlock, isTextBubbleBlock } from 'utils'
import { BlockNodeContent } from './BlockNodeContent/BlockNodeContent'
import { useTypebot } from 'contexts/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { SettingsPopoverContent } from './SettingsPopoverContent'
import { BlockNodeContextMenu } from './BlockNodeContextMenu'
import { SourceEndpoint } from '../../Endpoints/SourceEndpoint'
import { hasDefaultConnector } from 'services/typebots'
import { useRouter } from 'next/router'
import { SettingsModal } from './SettingsPopoverContent/SettingsModal'
import { BlockSettings } from './SettingsPopoverContent/SettingsPopoverContent'
import { TextBubbleEditor } from './TextBubbleEditor'
import { TargetEndpoint } from '../../Endpoints'
import { MediaBubblePopoverContent } from './MediaBubblePopoverContent'
import { NodePosition, useDragDistance } from 'contexts/GraphDndContext'
import { setMultipleRefs } from 'services/utils'

export const BlockNode = ({
  block,
  isConnectable,
  indices,
  onMouseDown,
}: {
  block: Block
  isConnectable: boolean
  indices: { blockIndex: number; groupIndex: number }
  onMouseDown?: (blockNodePosition: NodePosition, block: DraggableBlock) => void
}) => {
  const { query } = useRouter()
  const {
    setConnectingIds,
    connectingIds,
    openedBlockId,
    setOpenedBlockId,
    setFocusedGroupId,
    previewingEdge,
  } = useGraph()
  const { typebot, updateBlock } = useTypebot()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPopoverOpened, setIsPopoverOpened] = useState(
    openedBlockId === block.id
  )
  const [isEditing, setIsEditing] = useState<boolean>(
    isTextBubbleBlock(block) && block.content.plainText === ''
  )
  const blockRef = useRef<HTMLDivElement | null>(null)

  const isPreviewing = isConnecting || previewingEdge?.to.blockId === block.id

  const onDrag = (position: NodePosition) => {
    if (block.type === 'start' || !onMouseDown) return
    onMouseDown(position, block)
  }
  useDragDistance({
    ref: blockRef,
    onDrag,
    isDisabled: !onMouseDown || block.type === 'start',
  })

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure()

  useEffect(() => {
    if (query.blockId?.toString() === block.id) setOpenedBlockId(block.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.groupId === block.groupId &&
        connectingIds?.target?.blockId === block.id
    )
  }, [connectingIds, block.groupId, block.id])

  const handleModalClose = () => {
    updateBlock(indices, { ...block })
    onModalClose()
  }

  const handleMouseEnter = () => {
    if (connectingIds)
      setConnectingIds({
        ...connectingIds,
        target: { groupId: block.groupId, blockId: block.id },
      })
  }

  const handleMouseLeave = () => {
    if (connectingIds?.target)
      setConnectingIds({
        ...connectingIds,
        target: { ...connectingIds.target, blockId: undefined },
      })
  }

  const handleCloseEditor = (content: TextBubbleContent) => {
    const updatedBlock = { ...block, content } as Block
    updateBlock(indices, updatedBlock)
    setIsEditing(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    setFocusedGroupId(block.groupId)
    e.stopPropagation()
    if (isTextBubbleBlock(block)) setIsEditing(true)
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
    setIsPopoverOpened(openedBlockId === block.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedBlockId])

  return isEditing && isTextBubbleBlock(block) ? (
    <TextBubbleEditor
      id={block.id}
      initialValue={block.content.richText}
      onClose={handleCloseEditor}
    />
  ) : (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <BlockNodeContextMenu indices={indices} />}
    >
      {(ref, isOpened) => (
        <Popover
          placement="left"
          isLazy
          isOpen={isPopoverOpened}
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Flex
              pos="relative"
              ref={setMultipleRefs([ref, blockRef])}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              data-testid={`block`}
              w="full"
            >
              <HStack
                flex="1"
                userSelect="none"
                p="3"
                borderWidth={isOpened || isPreviewing ? '2px' : '1px'}
                borderColor={isOpened || isPreviewing ? 'blue.400' : 'gray.200'}
                margin={isOpened || isPreviewing ? '-1px' : 0}
                rounded="lg"
                cursor={'pointer'}
                bgColor="gray.50"
                align="flex-start"
                w="full"
                transition="border-color 0.2s"
              >
                <BlockIcon
                  type={block.type}
                  mt="1"
                  data-testid={`${block.id}-icon`}
                />
                <BlockNodeContent block={block} indices={indices} />
                <TargetEndpoint
                  pos="absolute"
                  left="-32px"
                  top="19px"
                  blockId={block.id}
                />
                {isConnectable && hasDefaultConnector(block) && (
                  <SourceEndpoint
                    source={{
                      groupId: block.groupId,
                      blockId: block.id,
                    }}
                    pos="absolute"
                    right="-34px"
                    bottom="10px"
                  />
                )}
              </HStack>
            </Flex>
          </PopoverTrigger>
          {hasSettingsPopover(block) && (
            <>
              <SettingsPopoverContent
                block={block}
                onExpandClick={handleExpandClick}
                onBlockChange={handleBlockUpdate}
              />
              <SettingsModal isOpen={isModalOpen} onClose={handleModalClose}>
                <BlockSettings
                  block={block}
                  onBlockChange={handleBlockUpdate}
                />
              </SettingsModal>
            </>
          )}
          {typebot && isMediaBubbleBlock(block) && (
            <MediaBubblePopoverContent
              typebotId={typebot.id}
              block={block}
              onContentChange={handleContentChange}
            />
          )}
        </Popover>
      )}
    </ContextMenu>
  )
}

const hasSettingsPopover = (
  block: Block
): block is BlockWithOptions | ConditionBlock => !isBubbleBlock(block)

const isMediaBubbleBlock = (
  block: Block
): block is Exclude<BubbleBlock, TextBubbleBlock> =>
  isBubbleBlock(block) && !isTextBubbleBlock(block)
