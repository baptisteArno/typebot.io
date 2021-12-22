import { DashboardFolder } from '.prisma/client'
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
import { useDroppable } from '@dnd-kit/core'
import { FolderIcon, MoreVerticalIcon } from 'assets/icons'
import { ConfirmModal } from 'components/modals/ConfirmModal'
import { useRouter } from 'next/router'
import React from 'react'
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
  const { setNodeRef, isOver } = useDroppable({
    id: folder.id.toString(),
  })
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

  return (
    <Button
      as={WrapItem}
      ref={setNodeRef}
      style={{ width: '225px', height: '270px' }}
      paddingX={6}
      whiteSpace={'normal'}
      pos="relative"
      cursor="pointer"
      variant="outline"
      colorScheme={isOver ? 'blue' : 'gray'}
      borderWidth={isOver ? '3px' : '1px'}
      justifyContent="center"
      onClick={handleClick}
      data-testid="folder-button"
    >
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<MoreVerticalIcon />}
          aria-label="Show folder menu"
          onClick={(e) => e.stopPropagation()}
          colorScheme="blue"
          variant="ghost"
          size="lg"
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
          <EditablePreview _hover={{ bgColor: 'gray.300' }} px="2" />
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
