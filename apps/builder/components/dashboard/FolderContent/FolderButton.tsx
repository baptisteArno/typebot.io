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
  useToast,
  SkeletonText,
  SkeletonCircle,
  WrapItem,
} from '@chakra-ui/react'
import { FolderIcon, MoreVerticalIcon } from 'assets/icons'
import { ConfirmModal } from 'components/modals/ConfirmModal'
import { useTypebotDnd } from 'contexts/TypebotDndContext'
import { DashboardFolder } from 'model'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'
import { deleteFolder, updateFolder } from 'services/folders'

export const FolderButton = ({
  folder,
  onFolderDeleted,
  onFolderRenamed,
}: {
  folder: DashboardFolder
  onFolderDeleted: () => void
  onFolderRenamed: (newName: string) => void
}) => {
  const router = useRouter()
  const { draggedTypebot, setMouseOverFolderId, mouseOverFolderId } =
    useTypebotDnd()
  const isTypebotOver = useMemo(
    () => draggedTypebot && mouseOverFolderId === folder.id,
    [draggedTypebot, folder.id, mouseOverFolderId]
  )
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const onDeleteClick = async () => {
    const { error } = await deleteFolder(folder.id)
    return error
      ? toast({
          title: "Couldn't delete the folder",
          description: error.message,
        })
      : onFolderDeleted()
  }

  const onRenameSubmit = async (newName: string) => {
    if (newName === '' || newName === folder.name) return
    const { error } = await updateFolder(folder.id, { name: newName })
    return error
      ? toast({ title: 'An error occured', description: error.message })
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
            Delete
          </MenuItem>
        </MenuList>
      </Menu>
      <VStack spacing="4">
        <FolderIcon fontSize={50} color="blue.500" fill="blue.500" />
        <Editable
          defaultValue={folder.name}
          fontSize="18"
          onClick={(e) => e.stopPropagation()}
          onSubmit={onRenameSubmit}
        >
          <EditablePreview
            _hover={{ bgColor: 'gray.300' }}
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
            Are you sure you want to delete <strong>{folder.name}</strong>{' '}
            folder? (Everything inside will be move to your dashboard)
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
