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
import React, { useEffect, useState } from 'react'
import { BackButton } from './BackButton'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { CreateBotButton } from './CreateBotButton'
import FolderButton, { ButtonSkeleton } from './FolderButton'
import TypebotButton from './TypebotButton'
import { TypebotCardOverlay } from './TypebotButtonOverlay'
import { useTypebots } from '@/features/dashboard/hooks/useTypebots'
import { TypebotInDashboard } from '@/features/dashboard/types'
import { trpc } from '@/lib/trpc'
import { NodePosition } from '@/features/graph/providers/GraphDndProvider'

type Props = { folder: DashboardFolder | null }

export const FolderContent = ({ folder }: Props) => {
  const { workspace, currentRole } = useWorkspace()
  const {
    setDraggedTypebot,
    draggedTypebot,
    mouseOverFolderId,
    setMouseOverFolderId,
  } = useTypebotDnd()
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 })
  const [mousePositionInElement, setMousePositionInElement] = useState({
    x: 0,
    y: 0,
  })

  const { showToast } = useToast()

  const {
    data: { folders } = {},
    isLoading: isFolderLoading,
    refetch: refetchFolders,
  } = trpc.folders.listFolders.useQuery(
    {
      workspaceId: workspace?.id as string,
      parentFolderId: folder?.id,
    },
    {
      enabled: !!workspace,
      onError: (error) => {
        showToast({
          description: error.message,
        })
      },
    }
  )

  const { mutate: updateTypebot } = trpc.typebot.updateTypebot.useMutation({
    onError: (error) => {
      showToast({ description: error.message })
    },
    onSuccess: () => {
      refetchTypebots()
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
    updateTypebot({
      typebotId,
      typebot: {
        folderId: folderId === 'root' ? null : folderId,
      },
    })
  }

  const handleMouseUp = async () => {
    if (mouseOverFolderId !== undefined && draggedTypebot)
      await moveTypebotToFolder(draggedTypebot.id, mouseOverFolderId ?? 'root')
    setMouseOverFolderId(undefined)
    setDraggedTypebot(undefined)
  }
  useEventListener('mouseup', handleMouseUp)

  const handleTypebotDrag =
    (typebot: TypebotInDashboard) =>
    ({ absolute, relative }: NodePosition) => {
      if (draggedTypebot) return
      setMousePositionInElement(relative)
      setDraggablePosition({
        x: absolute.x - relative.x,
        y: absolute.y - relative.y,
      })
      setDraggedTypebot(typebot)
    }

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedTypebot) return
    const { clientX, clientY } = e
    setDraggablePosition({
      x: clientX - mousePositionInElement.x,
      y: clientY - mousePositionInElement.y,
    })
  }
  useEventListener('mousemove', handleMouseMove)

  useEffect(() => {
    if (!draggablePosition || !draggedTypebot) return
    const { innerHeight } = window
    const scrollSpeed = 10
    const scrollMargin = 50
    const clientY = draggablePosition.y + mousePositionInElement.y
    const scrollY =
      clientY < scrollMargin
        ? -scrollSpeed
        : clientY > innerHeight - scrollMargin
        ? scrollSpeed
        : 0
    window.scrollBy(0, scrollY)
    const interval = setInterval(() => {
      window.scrollBy(0, scrollY)
    }, 5)

    return () => {
      clearInterval(interval)
    }
  }, [draggablePosition, draggedTypebot, mousePositionInElement])

  return (
    <Flex w="full" flex="1" justify="center">
      <Stack w="1000px" spacing={6} pt="4">
        <Skeleton isLoaded={folder?.name !== undefined}>
          <Heading as="h1">{folder?.name}</Heading>
        </Skeleton>
        <Stack>
          <HStack>{folder && <BackButton id={folder.parentFolderId} />}</HStack>
          <Wrap spacing={4}>
            {currentRole !== WorkspaceRole.GUEST && (
              <CreateBotButton
                folderId={folder?.id}
                isLoading={isTypebotLoading}
              />
            )}
            {isFolderLoading && <ButtonSkeleton />}
            {folders &&
              folders.map((folder, index) => (
                <FolderButton
                  key={folder.id}
                  index={index}
                  folder={folder}
                  onFolderDeleted={refetchFolders}
                  onFolderRenamed={() => refetchFolders()}
                />
              ))}
            {isTypebotLoading && <ButtonSkeleton />}
            {typebots &&
              typebots.map((typebot) => (
                <TypebotButton
                  key={typebot.id}
                  typebot={typebot}
                  draggedTypebot={draggedTypebot}
                  onTypebotUpdated={refetchTypebots}
                  onDrag={handleTypebotDrag(typebot)}
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
            transformOrigin="0 0 0"
          />
        </Portal>
      )}
    </Flex>
  )
}
