import React, { memo } from 'react'
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
import { useDebounce } from 'use-debounce'
import { useToast } from '@/hooks/useToast'
import { MoreButton } from './MoreButton'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { T, useTranslate } from '@tolgee/react'
import { SniperInDashboard } from '@/features/dashboard/types'
import { isMobile } from '@/helpers/isMobile'
import { trpc, trpcVanilla } from '@/lib/trpc'
import { duplicateName } from '@/features/sniper/helpers/duplicateName'
import {
  NodePosition,
  useDragDistance,
} from '@/features/graph/providers/GraphDndProvider'

type Props = {
  sniper: SniperInDashboard
  isReadOnly?: boolean
  draggedSniper: SniperInDashboard | undefined
  onSniperUpdated: () => void
  onDrag: (position: NodePosition) => void
}

const SniperButton = ({
  sniper,
  isReadOnly = false,
  draggedSniper,
  onSniperUpdated,
  onDrag,
}: Props) => {
  const { t } = useTranslate()
  const router = useRouter()
  const [draggedSniperDebounced] = useDebounce(draggedSniper, 200)
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure()
  const buttonRef = React.useRef<HTMLDivElement>(null)

  useDragDistance({
    ref: buttonRef,
    onDrag,
    deps: [],
  })

  const { showToast } = useToast()

  const { mutate: importSniper } = trpc.sniper.importSniper.useMutation({
    onError: (error) => {
      showToast({ description: error.message })
    },
    onSuccess: ({ sniper }) => {
      router.push(`/snipers/${sniper.id}/edit`)
    },
  })

  const { mutate: deleteSniper } = trpc.sniper.deleteSniper.useMutation({
    onError: (error) => {
      showToast({ description: error.message })
    },
    onSuccess: () => {
      onSniperUpdated()
    },
  })

  const { mutate: unpublishSniper } = trpc.sniper.unpublishSniper.useMutation({
    onError: (error) => {
      showToast({ description: error.message })
    },
    onSuccess: () => {
      onSniperUpdated()
    },
  })

  const handleSniperClick = () => {
    if (draggedSniperDebounced) return
    router.push(
      isMobile ? `/snipers/${sniper.id}/results` : `/snipers/${sniper.id}/edit`
    )
  }

  const handleDeleteSniperClick = async () => {
    if (isReadOnly) return
    deleteSniper({
      sniperId: sniper.id,
    })
  }

  const handleDuplicateClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const { sniper: sniperToDuplicate } =
      await trpcVanilla.sniper.getSniper.query({
        sniperId: sniper.id,
      })
    if (!sniperToDuplicate) return
    importSniper({
      workspaceId: sniperToDuplicate.workspaceId,
      sniper: {
        ...sniperToDuplicate,
        name: duplicateName(sniperToDuplicate.name),
      },
    })
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteOpen()
  }

  const handleUnpublishClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!sniper.publishedSniperId) return
    unpublishSniper({ sniperId: sniper.id })
  }

  return (
    <Button
      ref={buttonRef}
      as={WrapItem}
      onClick={handleSniperClick}
      display="flex"
      flexDir="column"
      variant="outline"
      w="225px"
      h="270px"
      rounded="lg"
      whiteSpace="normal"
      opacity={draggedSniper ? 0.3 : 1}
      cursor="pointer"
    >
      {sniper.publishedSniperId && (
        <Tag
          colorScheme="blue"
          variant="solid"
          rounded="full"
          pos="absolute"
          top="27px"
          size="sm"
        >
          {t('folders.sniperButton.live')}
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
            aria-label={t('folders.sniperButton.showMoreOptions')}
          >
            {sniper.publishedSniperId && (
              <MenuItem onClick={handleUnpublishClick}>
                {t('folders.sniperButton.unpublish')}
              </MenuItem>
            )}
            <MenuItem onClick={handleDuplicateClick}>
              {t('folders.sniperButton.duplicate')}
            </MenuItem>
            <MenuItem color="red.400" onClick={handleDeleteClick}>
              {t('folders.sniperButton.delete')}
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
          {<EmojiOrImageIcon icon={sniper.icon} boxSize={'35px'} />}
        </Flex>
        <Text textAlign="center" noOfLines={4} maxW="180px">
          {sniper.name}
        </Text>
      </VStack>
      {!isReadOnly && (
        <ConfirmModal
          message={
            <Stack spacing="4">
              <Text>
                <T
                  keyName="folders.sniperButton.deleteConfirmationMessage"
                  params={{
                    strong: <strong>{sniper.name}</strong>,
                  }}
                />
              </Text>
              <Alert status="warning">
                <AlertIcon />
                {t('folders.sniperButton.deleteConfirmationMessageWarning')}
              </Alert>
            </Stack>
          }
          confirmButtonLabel={t('delete')}
          onConfirm={handleDeleteSniperClick}
          isOpen={isDeleteOpen}
          onClose={onDeleteClose}
        />
      )}
    </Button>
  )
}

export default memo(
  SniperButton,
  (prev, next) =>
    prev.draggedSniper?.id === next.draggedSniper?.id &&
    prev.sniper.id === next.sniper.id &&
    prev.isReadOnly === next.isReadOnly &&
    prev.sniper.name === next.sniper.name &&
    prev.sniper.icon === next.sniper.icon &&
    prev.sniper.publishedSniperId === next.sniper.publishedSniperId
)
