import React from 'react'
import {
  Button,
  Flex,
  MenuItem,
  Text,
  useDisclosure,
  useToast,
  VStack,
  WrapItem,
} from '@chakra-ui/react'
import { useDraggable } from '@dnd-kit/core'
import { useRouter } from 'next/router'
import { isMobile } from 'services/utils'
import { MoreButton } from 'components/MoreButton'
import { ConfirmModal } from 'components/modals/ConfirmModal'
import { GlobeIcon, ToolIcon } from 'assets/icons'
import { deleteTypebot, duplicateTypebot } from 'services/typebots'
import { Typebot } from 'bot-engine'

type ChatbotCardProps = {
  typebot: Typebot
  onTypebotDeleted: () => void
}

export const TypebotButton = ({
  typebot,
  onTypebotDeleted,
}: ChatbotCardProps) => {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: typebot.id.toString(),
  })
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const handleTypebotClick = () => {
    router.push(
      isMobile
        ? `/typebots/${typebot.id}/results/responses`
        : `/typebots/${typebot.id}/edit`
    )
  }

  const handleDeleteTypebotClick = async () => {
    const { error } = await deleteTypebot(typebot.id)
    if (error)
      return toast({
        title: "Couldn't delete typebot",
        description: error.message,
      })
    onTypebotDeleted()
  }

  const handleDuplicateClick = async () => {
    const { data: createdTypebot, error } = await duplicateTypebot(typebot)
    if (error)
      return toast({
        title: "Couldn't duplicate typebot",
        description: error.message,
      })
    if (createdTypebot) router.push(`/typebots/${createdTypebot?.id}`)
  }

  return (
    <Button
      as={WrapItem}
      onClick={handleTypebotClick}
      display="flex"
      flexDir="column"
      variant="outline"
      color="gray.800"
      w="225px"
      h="270px"
      mr={{ sm: 6 }}
      mb={6}
      rounded="lg"
      whiteSpace="normal"
      data-testid={`typebot-button-${typebot.id}`}
      opacity={isDragging ? 0.2 : 1}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <MoreButton pos="absolute" top="10px" right="10px">
        <MenuItem onClick={handleDuplicateClick}>Duplicate</MenuItem>
        <MenuItem color="red" onClick={onDeleteOpen}>
          Delete
        </MenuItem>
      </MoreButton>
      <VStack spacing="4">
        <Flex
          boxSize="45px"
          rounded="full"
          justifyContent="center"
          alignItems="center"
          bgColor={typebot.publishedTypebotId ? 'blue.500' : 'gray.400'}
          color="white"
        >
          {typebot.publishedTypebotId ? (
            <GlobeIcon fill="white" fontSize="20px" />
          ) : (
            <ToolIcon fill="white" fontSize="20px" />
          )}
        </Flex>
        <Text>{typebot.name}</Text>
      </VStack>
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
    </Button>
  )
}
