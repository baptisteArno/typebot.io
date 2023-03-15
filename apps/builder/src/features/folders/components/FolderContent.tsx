import { DashboardFolder, WorkspaceRole } from '@typebot.io/prisma'
import {
  Flex,
  Heading,
  HStack,
  Portal,
  Skeleton,
  Stack,
  useEventListener,
  Wrap,
} from '@chakra-ui/react'
import { useTypebotDnd } from '../TypebotDndProvider'
import React, { useState } from 'react'
import { BackButton } from './BackButton'
import { OnboardingModal } from '../../dashboard/components/OnboardingModal'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { useFolders } from '../hooks/useFolders'
import { patchTypebotQuery } from '../queries/patchTypebotQuery'
import { createFolderQuery } from '../queries/createFolderQuery'
import { CreateBotButton } from './CreateBotButton'
import { CreateFolderButton } from './CreateFolderButton'
import { ButtonSkeleton, FolderButton } from './FolderButton'
import { TypebotButton } from './TypebotButton'
import { TypebotCardOverlay } from './TypebotButtonOverlay'
import { useI18n } from '@/locales'
import { useTypebots } from '@/features/dashboard/hooks/useTypebots'
import { TypebotInDashboard } from '@/features/dashboard/types'

type Props = { folder: DashboardFolder | null }

const dragDistanceTolerance = 20

export const FolderContent = ({ folder }: Props) => {
  const t = useI18n()
  const { workspace, currentRole } = useWorkspace()
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const {
    setDraggedTypebot,
    draggedTypebot,
    mouseOverFolderId,
    setMouseOverFolderId,
  } = useTypebotDnd()
  const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 })
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 })
  const [relativeDraggablePosition, setRelativeDraggablePosition] = useState({
    x: 0,
    y: 0,
  })
  const [typebotDragCandidate, setTypebotDragCandidate] =
    useState<TypebotInDashboard>()

  const { showToast } = useToast()

  const {
    folders,
    isLoading: isFolderLoading,
    mutate: mutateFolders,
  } = useFolders({
    workspaceId: workspace?.id,
    parentId: folder?.id,
    onError: (error) => {
      showToast({
        description: error.message,
      })
    },
  })

  const {
    typebots,
    isLoading: isTypebotLoading,
    refetch: refetchTypebots,
  } = useTypebots({
    workspaceId: workspace?.id,
    folderId: folder === null ? 'root' : folder.id,
    onError: (error) => {
      showToast({
        description: error.message,
      })
    },
  })

  const moveTypebotToFolder = async (typebotId: string, folderId: string) => {
    if (!typebots) return
    const { error } = await patchTypebotQuery(typebotId, {
      folderId: folderId === 'root' ? null : folderId,
    })
    if (error) showToast({ description: error.message })
    refetchTypebots()
  }

  const handleCreateFolder = async () => {
    if (!folders || !workspace) return
    setIsCreatingFolder(true)
    const { error, data: newFolder } = await createFolderQuery(workspace.id, {
      parentFolderId: folder?.id ?? null,
    })
    setIsCreatingFolder(false)
    if (error)
      return showToast({
        title: t('errorMessage'),
        description: error.message,
      })
    if (newFolder) mutateFolders({ folders: [...folders, newFolder] })
  }

  const handleTypebotUpdated = () => {
    if (!typebots) return
    refetchTypebots()
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

  const handleMouseUp = async () => {
    if (mouseOverFolderId !== undefined && draggedTypebot)
      await moveTypebotToFolder(draggedTypebot.id, mouseOverFolderId ?? 'root')
    setTypebotDragCandidate(undefined)
    setMouseOverFolderId(undefined)
    setDraggedTypebot(undefined)
  }
  useEventListener('mouseup', handleMouseUp)

  const handleMouseDown =
    (typebot: TypebotInDashboard) => (e: React.MouseEvent) => {
      const element = e.currentTarget as HTMLDivElement
      const rect = element.getBoundingClientRect()
      setDraggablePosition({ x: rect.left, y: rect.top })
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setRelativeDraggablePosition({ x, y })
      setMouseDownPosition({ x: e.screenX, y: e.screenY })
      setTypebotDragCandidate(typebot)
    }

  const handleMouseMove = (e: MouseEvent) => {
    if (!typebotDragCandidate) return
    const { clientX, clientY, screenX, screenY } = e
    if (
      Math.abs(mouseDownPosition.x - screenX) > dragDistanceTolerance ||
      Math.abs(mouseDownPosition.y - screenY) > dragDistanceTolerance
    )
      setDraggedTypebot(typebotDragCandidate)
    setDraggablePosition({
      ...draggablePosition,
      x: clientX - relativeDraggablePosition.x,
      y: clientY - relativeDraggablePosition.y,
    })
  }
  useEventListener('mousemove', handleMouseMove)

  return (
    <Flex w="full" flex="1" justify="center">
      {typebots && <OnboardingModal totalTypebots={typebots.length} />}
      <Stack w="1000px" spacing={6}>
        <Skeleton isLoaded={folder?.name !== undefined}>
          <Heading as="h1">{folder?.name}</Heading>
        </Skeleton>
        <Stack>
          <HStack>
            {folder && <BackButton id={folder.parentFolderId} />}
            {currentRole !== WorkspaceRole.GUEST && (
              <CreateFolderButton
                onClick={handleCreateFolder}
                isLoading={isCreatingFolder || isFolderLoading}
              />
            )}
          </HStack>
          <Wrap spacing={4}>
            {currentRole !== WorkspaceRole.GUEST && (
              <CreateBotButton
                folderId={folder?.id}
                isLoading={isTypebotLoading}
                isFirstBot={typebots?.length === 0 && folder === null}
              />
            )}
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
                  onTypebotUpdated={handleTypebotUpdated}
                  onMouseDown={handleMouseDown(typebot)}
                />
              ))}
          </Wrap>
        </Stack>
      </Stack>
      {draggedTypebot && (
        <Portal>
          <TypebotCardOverlay
            typebot={draggedTypebot}
            onMouseUp={handleMouseUp}
            pos="fixed"
            top="0"
            left="0"
            style={{
              transform: `translate(${draggablePosition.x}px, ${draggablePosition.y}px) rotate(-2deg)`,
            }}
          />
        </Portal>
      )}
    </Flex>
  )
}
