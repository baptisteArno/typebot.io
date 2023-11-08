import React from 'react'
import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  IconButton,
  MenuItem,
  Stack,
  Tag,
  Text,
  useDisclosure,
  VStack,
  WrapItem,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { ConfirmModal } from '@/components/ConfirmModal'
import { GripIcon } from '@/components/icons'
import { useTypebotDnd } from '../TypebotDndProvider'
import { useDebounce } from 'use-debounce'
import { useToast } from '@/hooks/useToast'
import { MoreButton } from './MoreButton'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { T, useTranslate } from '@tolgee/react'
import { TypebotInDashboard } from '@/features/dashboard/types'
import { isMobile } from '@/helpers/isMobile'
import { trpc, trpcVanilla } from '@/lib/trpc'
import { duplicateName } from '@/features/typebot/helpers/duplicateName'

type Props = {
  typebot: TypebotInDashboard
  isReadOnly?: boolean
  onTypebotUpdated: () => void
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export const TypebotButton = ({
  typebot,
  isReadOnly = false,
  onTypebotUpdated,
  onMouseDown,
}: Props) => {
  const { t } = useTranslate()
  const router = useRouter()
  const { draggedTypebot } = useTypebotDnd()
  const [draggedTypebotDebounced] = useDebounce(draggedTypebot, 200)
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()

  const { showToast } = useToast()

  const { mutate: importTypebot } = trpc.typebot.importTypebot.useMutation({
    onError: (error) => {
      showToast({ description: error.message })
    },
    onSuccess: ({ typebot }) => {
      router.push(`/typebots/${typebot.id}/edit`)
    },
  })

  const { mutate: deleteTypebot } = trpc.typebot.deleteTypebot.useMutation({
    onError: (error) => {
      showToast({ description: error.message })
    },
    onSuccess: () => {
      onTypebotUpdated()
    },
  })

  const { mutate: unpublishTypebot } =
    trpc.typebot.unpublishTypebot.useMutation({
      onError: (error) => {
        showToast({ description: error.message })
      },
      onSuccess: () => {
        onTypebotUpdated()
      },
    })

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
    deleteTypebot({
      typebotId: typebot.id,
    })
  }

  const handleDuplicateClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const { typebot: typebotToDuplicate } =
      await trpcVanilla.typebot.getTypebot.query({
        typebotId: typebot.id,
      })
    if (!typebotToDuplicate) return
    importTypebot({
      workspaceId: typebotToDuplicate.workspaceId,
      typebot: {
        ...typebotToDuplicate,
        name: duplicateName(typebotToDuplicate.name),
      },
    })
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteOpen()
  }

  const handleUnpublishClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!typebot.publishedTypebotId) return
    unpublishTypebot({ typebotId: typebot.id })
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
          {t('folders.typebotButton.live')}
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
            aria-label={t('folders.typebotButton.showMoreOptions')}
          >
            {typebot.publishedTypebotId && (
              <MenuItem onClick={handleUnpublishClick}>
                {t('folders.typebotButton.unpublish')}
              </MenuItem>
            )}
            <MenuItem onClick={handleDuplicateClick}>
              {t('folders.typebotButton.duplicate')}
            </MenuItem>
            <MenuItem color="red.400" onClick={handleDeleteClick}>
              {t('folders.typebotButton.delete')}
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
        <Text textAlign="center" noOfLines={4} maxW="180px">
          {typebot.name}
        </Text>
      </VStack>
      {!isReadOnly && (
        <ConfirmModal
          message={
            <Stack spacing="4">
              <Text>
                <T
                  keyName="folders.typebotButton.deleteConfirmationMessage"
                  params={{
                    strong: <strong>{typebot.name}</strong>,
                  }}
                />
              </Text>
              <Alert status="warning">
                <AlertIcon />
                {t('folders.typebotButton.deleteConfirmationMessageWarning')}
              </Alert>
            </Stack>
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
