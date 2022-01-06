import { DashboardFolder } from '.prisma/client'
import { Typebot } from 'models'
import {
  Button,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Stack,
  useToast,
  Wrap,
} from '@chakra-ui/react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { FolderPlusIcon } from 'assets/icons'
import React, { useState } from 'react'
import { createFolder, useFolders } from 'services/folders'
import { patchTypebot, useTypebots } from 'services/typebots'
import { BackButton } from './FolderContent/BackButton'
import { CreateBotButton } from './FolderContent/CreateBotButton'
import { ButtonSkeleton, FolderButton } from './FolderContent/FolderButton'
import { TypebotButton } from './FolderContent/TypebotButton'
import { TypebotCardOverlay } from './FolderContent/TypebotButtonOverlay'

type Props = { folder: DashboardFolder | null }

export const FolderContent = ({ folder }: Props) => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [draggedTypebot, setDraggedTypebot] = useState<Typebot | undefined>()
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 20,
      },
    })
  )
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })
  const {
    folders,
    isLoading: isFolderLoading,
    mutate: mutateFolders,
  } = useFolders({
    parentId: folder?.id,
    onError: (error) => {
      toast({ title: "Couldn't fetch folders", description: error.message })
    },
  })

  const {
    typebots,
    isLoading: isTypebotLoading,
    mutate: mutateTypebots,
  } = useTypebots({
    folderId: folder?.id,
    onError: (error) => {
      toast({ title: "Couldn't fetch typebots", description: error.message })
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    if (!typebots) return
    setDraggedTypebot(typebots.find((c) => c.id === event.active.id))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!typebots) return
    const { over } = event
    if (over?.id && draggedTypebot?.id)
      await moveTypebotToFolder(draggedTypebot.id, over.id)
    setDraggedTypebot(undefined)
  }

  const moveTypebotToFolder = async (typebotId: string, folderId: string) => {
    if (!typebots) return
    const { error } = await patchTypebot(typebotId, {
      folderId: folderId === 'root' ? null : folderId,
    })
    if (error) toast({ description: error.message })
    mutateTypebots({ typebots: typebots.filter((t) => t.id !== typebotId) })
  }

  const handleCreateFolder = async () => {
    if (!folders) return
    setIsCreatingFolder(true)
    const { error, data: newFolder } = await createFolder({
      parentFolderId: folder?.id ?? null,
    })
    setIsCreatingFolder(false)
    if (error)
      return toast({ title: 'An error occured', description: error.message })
    if (newFolder) mutateFolders({ folders: [...folders, newFolder] })
  }

  const handleTypebotDeleted = (deletedId: string) => {
    if (!typebots) return
    mutateTypebots({ typebots: typebots.filter((t) => t.id !== deletedId) })
  }

  const handleFolderDeleted = (deletedId: string) => {
    if (!folders) return
    mutateFolders({ folders: folders.filter((f) => f.id !== deletedId) })
  }

  const handleFolderRenamed = (folderId: string, name: string) => {
    if (!folders) return
    mutateFolders({
      folders: folders.map((f) => (f.id === folderId ? { ...f, name } : f)),
    })
  }

  return (
    <Flex w="full" justify="center" align="center" pt={4}>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Stack w="1000px" spacing={6}>
          <Skeleton isLoaded={folder?.name !== undefined}>
            <Heading as="h1">{folder?.name}</Heading>
          </Skeleton>
          <Stack>
            <HStack>
              {folder && <BackButton id={folder.parentFolderId} />}
              <Button
                leftIcon={<FolderPlusIcon />}
                onClick={handleCreateFolder}
                isLoading={isCreatingFolder || isFolderLoading}
              >
                Create a folder
              </Button>
            </HStack>
            <Wrap spacing={4}>
              <CreateBotButton
                folderId={folder?.id}
                isLoading={isTypebotLoading}
              />
              {isFolderLoading && <ButtonSkeleton />}
              {folders &&
                folders.map((folder) => (
                  <FolderButton
                    key={folder.id.toString()}
                    folder={folder}
                    onFolderDeleted={() => handleFolderDeleted(folder.id)}
                    onFolderRenamed={(newName: string) =>
                      handleFolderRenamed(folder.id, newName)
                    }
                  />
                ))}
              {isTypebotLoading && <ButtonSkeleton />}
              {typebots &&
                typebots.map((typebot) => (
                  <TypebotButton
                    key={typebot.id.toString()}
                    typebot={typebot}
                    onTypebotDeleted={() => handleTypebotDeleted(typebot.id)}
                  />
                ))}
              <DragOverlay dropAnimation={null}>
                {draggedTypebot && (
                  <TypebotCardOverlay typebot={draggedTypebot} />
                )}
              </DragOverlay>
            </Wrap>
          </Stack>
        </Stack>
      </DndContext>
    </Flex>
  )
}
