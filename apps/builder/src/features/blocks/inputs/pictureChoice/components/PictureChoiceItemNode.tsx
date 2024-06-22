import {
  Fade,
  IconButton,
  Flex,
  Image,
  Popover,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  PopoverAnchor,
  useEventListener,
  useColorModeValue,
} from '@chakra-ui/react'
import { ImageIcon, PlusIcon } from '@/components/icons'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { ItemIndices } from '@sniper.io/schemas'
import React, { useRef } from 'react'
import { PictureChoiceItem } from '@sniper.io/schemas/features/blocks/inputs/pictureChoice'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { PictureChoiceItemSettings } from './PictureChoiceItemSettings'
import { isSvgSrc } from '@sniper.io/lib'

type Props = {
  item: PictureChoiceItem
  indices: ItemIndices
  isMouseOver: boolean
}

export const PictureChoiceItemNode = ({
  item,
  indices,
  isMouseOver,
}: Props) => {
  const emptyImageBgColor = useColorModeValue('gray.100', 'gray.700')
  const { openedItemId, setOpenedItemId } = useGraph()
  const { updateItem, createItem, sniper } = useSniper()
  const ref = useRef<HTMLDivElement | null>(null)

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const itemIndex = indices.itemIndex + 1
    createItem({}, { ...indices, itemIndex })
  }

  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const openPopover = () => {
    setOpenedItemId(item.id)
  }

  const handleItemChange = (updates: Partial<PictureChoiceItem>) => {
    updateItem(indices, { ...item, ...updates })
  }

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  useEventListener('wheel', handleMouseWheel, ref.current)

  const blockId = sniper
    ? sniper.groups.at(indices.groupIndex)?.blocks?.at(indices.blockIndex)?.id
    : undefined

  return (
    <Popover
      placement="right"
      isLazy
      isOpen={openedItemId === item.id}
      closeOnBlur={false}
    >
      <PopoverAnchor>
        <Flex
          px={4}
          py={2}
          justify="center"
          w="full"
          pos="relative"
          onClick={openPopover}
          data-testid="item-node"
          userSelect="none"
        >
          {item.pictureSrc ? (
            <Image
              src={item.pictureSrc}
              alt="Picture choice image"
              rounded="md"
              maxH={isSvgSrc(item.pictureSrc) ? '64px' : '128px'}
              w="full"
              objectFit={isSvgSrc(item.pictureSrc) ? 'contain' : 'cover'}
              p={isSvgSrc(item.pictureSrc) ? '2' : undefined}
              userSelect="none"
              draggable={false}
            />
          ) : (
            <Flex
              width="full"
              height="100px"
              bgColor={emptyImageBgColor}
              rounded="md"
              justify="center"
              align="center"
            >
              <ImageIcon />
            </Flex>
          )}
          <Fade
            in={isMouseOver}
            style={{
              position: 'absolute',
              bottom: '-15px',
              zIndex: 3,
              left: '90px',
            }}
            unmountOnExit
          >
            <IconButton
              aria-label="Add item"
              icon={<PlusIcon />}
              size="xs"
              shadow="md"
              colorScheme="gray"
              borderWidth={1}
              onClick={handlePlusClick}
            />
          </Fade>
        </Flex>
      </PopoverAnchor>
      <Portal>
        <PopoverContent pos="relative" onMouseDown={handleMouseDown}>
          <PopoverArrow />
          <PopoverBody
            py="6"
            overflowY="auto"
            maxH="400px"
            shadow="lg"
            ref={ref}
          >
            {sniper && blockId && (
              <PictureChoiceItemSettings
                workspaceId={sniper.workspaceId}
                sniperId={sniper.id}
                item={item}
                blockId={blockId}
                onItemChange={handleItemChange}
              />
            )}
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}
