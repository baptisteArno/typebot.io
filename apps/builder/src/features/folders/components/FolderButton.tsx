import { DashboardFolder } from '@typebot.io/prisma'
import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  MenuItem,
  useDisclosure,
  Text,
  VStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  SkeletonText,
  SkeletonCircle,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react'
import { FolderIcon, MoreVerticalIcon } from '@/components/icons'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useTypebotDnd } from '../TypebotDndProvider'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { deleteFolderQuery } from '../queries/deleteFolderQuery'
import { useToast } from '@/hooks/useToast'
import { updateFolderQuery } from '../queries/updateFolderQuery'
import { useI18n, useScopedI18n } from '@/locales'

export const FolderButton = ({
  folder,
  onFolderDeleted,
  onFolderRenamed,
}: {
  folder: DashboardFolder
  onFolderDeleted: () => void
  onFolderRenamed: (newName: string) => void
}) => {
  const t = useI18n()
  const scopedT = useScopedI18n('folders.folderButton')
  const router = useRouter()
  const { draggedTypebot, setMouseOverFolderId, mouseOverFolderId } =
    useTypebotDnd()
  const isTypebotOver = useMemo(
    () => draggedTypebot && mouseOverFolderId === folder.id,
    [draggedTypebot, folder.id, mouseOverFolderId]
  )
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { showToast } = useToast()

  const onDeleteClick = async () => {
    const { error } = await deleteFolderQuery(folder.id)
    return error
      ? showToast({
          description: error.message,
        })
      : onFolderDeleted()
  }

  const onRenameSubmit = async (newName: string) => {
    if (newName === '' || newName === folder.name) return
    const { error } = await updateFolderQuery(folder.id, { name: newName })
    return error
      ? showToast({ title: t('errorMessage'), description: error.message })
      : onFolderRenamed(newName)
  }

  const handleClick = () => {
    router.push(`/typebots/folders/${folder.id}`)
  }

  const handleMouseEnter = () => setMouseOverFolderId(folder.id)
  const handleMouseLeave = () => setMouseOverFolderId(undefined)
  return (
    <Button
      as={WrapItem}
      style={{ width: '225px', height: '270px' }}
      paddingX={6}
      whiteSpace={'normal'}
      pos="relative"
      cursor="pointer"
      variant="outline"
      colorScheme={isTypebotOver ? 'blue' : 'gray'}
      borderWidth={isTypebotOver ? '3px' : '1px'}
      justifyContent="center"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<MoreVerticalIcon />}
          aria-label={`Show ${folder.name} menu`}
          onClick={(e) => e.stopPropagation()}
          colorScheme="gray"
          variant="outline"
          size="sm"
          pos="absolute"
          top="5"
          right="5"
        />
        <MenuList>
          <MenuItem
            color="red"
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
          >
            {t('delete')}
          </MenuItem>
        </MenuList>
      </Menu>
      <VStack spacing="4">
        <FolderIcon
          fontSize={50}
          color={useColorModeValue('blue.500', 'blue.400')}
        />
        <Editable
          defaultValue={folder.name}
          fontSize="18"
          onClick={(e) => e.stopPropagation()}
          onSubmit={onRenameSubmit}
        >
          <EditablePreview
            _hover={{
              bg: useColorModeValue('gray.100', 'gray.700'),
            }}
            px="2"
            textAlign="center"
          />
          <EditableInput textAlign="center" />
        </Editable>
      </VStack>

      <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        confirmButtonLabel={'Delete'}
        message={
          <Text>
            {scopedT('deleteConfirmationMessage', {
              folderName: <strong>{folder.name}</strong>,
            })}
          </Text>
        }
        title={`Delete ${folder.name}?`}
        onConfirm={onDeleteClick}
        confirmButtonColor="red"
      />
    </Button>
  )
}

export const ButtonSkeleton = () => (
  <Button
    as={VStack}
    mr={{ sm: 6 }}
    mb={6}
    style={{ width: '225px', height: '270px' }}
    paddingX={6}
    whiteSpace={'normal'}
    pos="relative"
    cursor="pointer"
    variant="outline"
  >
    <VStack spacing="6" w="full">
      <SkeletonCircle boxSize="45px" />
      <SkeletonText noOfLines={2} w="full" />
    </VStack>
  </Button>
)
