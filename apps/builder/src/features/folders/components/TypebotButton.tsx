import React from 'react'
import {
  Button,
  Flex,
  IconButton,
  MenuItem,
  Tag,
  Text,
  useDisclosure,
  VStack,
  WrapItem,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ConfirmModal } from '@/components/ConfirmModal'
import { GripIcon } from '@/components/icons'
import { Typebot } from 'models'
import { useTypebotDnd } from '../TypebotDndProvider'
import { useDebounce } from 'use-debounce'
import { Plan } from 'db'
import { useWorkspace } from '@/features/workspace'
import { useToast } from '@/hooks/useToast'
import { isMobile } from '@/utils/helpers'
import {
  getTypebotQuery,
  deleteTypebotQuery,
  importTypebotQuery,
} from '@/features/dashboard'
import { MoreButton } from './MoreButton'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'

type ChatbotCardProps = {
  typebot: Pick<Typebot, 'id' | 'publishedTypebotId' | 'name' | 'icon'>
  isReadOnly?: boolean
  onTypebotDeleted?: () => void
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const TypebotButton = ({
  typebot,
  onTypebotDeleted,
  isReadOnly = false,
  onMouseDown,
}: ChatbotCardProps) => {
  const router = useRouter()
  const { workspace } = useWorkspace()
  const { draggedTypebot } = useTypebotDnd()
  const [draggedTypebotDebounced] = useDebounce(draggedTypebot, 200)
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  const { showToast } = useToast()

  const handleTypebotClick = () => {
    if (draggedTypebotDebounced) return
    router.push(
      isMobile
        ? `/typebots/${typebot.id}/results`
        : `/typebots/${typebot.id}/edit`
    )
  }

  const handleDeleteTypebotClick = async () => {
    if (isReadOnly) return
    const { error } = await deleteTypebotQuery(typebot.id)
    if (error)
      return showToast({
        title: "Couldn't delete typebot",
        description: error.message,
      })
    if (onTypebotDeleted) onTypebotDeleted()
  }

  const handleDuplicateClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const { data } = await getTypebotQuery(typebot.id)
    const typebotToDuplicate = data?.typebot
    if (!typebotToDuplicate) return { error: new Error('Typebot not found') }
    const { data: createdTypebot, error } = await importTypebotQuery(
      data.typebot,
      workspace?.plan ?? Plan.FREE
    )
    if (error)
      return showToast({
        title: "Couldn't duplicate typebot",
        description: error.message,
      })
    if (createdTypebot) router.push(`/typebots/${createdTypebot?.id}/edit`)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteOpen()
  }

  return (
    <Button
      as={WrapItem}
      onClick={handleTypebotClick}
      display="flex"
      flexDir="column"
      variant="outline"
      w="225px"
      h="270px"
      mr={{ sm: 6 }}
      mb={6}
      rounded="lg"
      whiteSpace="normal"
      opacity={draggedTypebot?.id === typebot.id ? 0.2 : 1}
      onMouseDown={onMouseDown}
      cursor="pointer"
    >
      {typebot.publishedTypebotId && (
        <Tag
          colorScheme="blue"
          variant="solid"
          rounded="full"
          pos="absolute"
          top="27px"
          size="sm"
        >
          Live
        </Tag>
      )}
      {!isReadOnly && (
        <>
          <IconButton
            icon={<GripIcon />}
            pos="absolute"
            top="20px"
            left="20px"
            aria-label="Drag"
            cursor="grab"
            variant="ghost"
            colorScheme="blue"
            size="sm"
          />
          <MoreButton
            pos="absolute"
            top="20px"
            right="20px"
            aria-label={`Show ${typebot.name} menu`}
          >
            <MenuItem onClick={handleDuplicateClick}>Duplicate</MenuItem>
            <MenuItem color="red" onClick={handleDeleteClick}>
              Delete
            </MenuItem>
          </MoreButton>
        </>
      )}
      <VStack spacing="4">
        <Flex
          rounded="full"
          justifyContent="center"
          alignItems="center"
          fontSize={'4xl'}
        >
          {<EmojiOrImageIcon icon={typebot.icon} boxSize={'35px'} />}
        </Flex>
        <Text textAlign="center">{typebot.name}</Text>
      </VStack>
      {!isReadOnly && (
        <ConfirmModal
          message={
            <Text>
              Are you sure you want to delete your Typebot &quot;{typebot.name}
              &quot;.
              <br />
              All associated data will be lost.
            </Text>
          }
          confirmButtonLabel="Delete"
          onConfirm={handleDeleteTypebotClick}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
        />
      )}
    </Button>
  )
}
