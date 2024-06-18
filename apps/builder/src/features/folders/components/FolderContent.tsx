import { DashboardFolder, WorkspaceRole } from '@sniper.io/prisma'
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
import { useSniperDnd } from '../SniperDndProvider'
import React, { useEffect, useState } from 'react'
import { BackButton } from './BackButton'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { CreateBotButton } from './CreateBotButton'
import { CreateFolderButton } from './CreateFolderButton'
import FolderButton, { ButtonSkeleton } from './FolderButton'
import SniperButton from './SniperButton'
import { SniperCardOverlay } from './SniperButtonOverlay'
import { useSnipers } from '@/features/dashboard/hooks/useSnipers'
import { SniperInDashboard } from '@/features/dashboard/types'
import { trpc } from '@/lib/trpc'
import { NodePosition } from '@/features/graph/providers/GraphDndProvider'

type Props = { folder: DashboardFolder | null }

export const FolderContent = ({ folder }: Props) => {
  const { workspace, currentRole } = useWorkspace()
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const {
    setDraggedSniper,
    draggedSniper,
    mouseOverFolderId,
    setMouseOverFolderId,
  } = useSniperDnd()
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

  const { mutate: createFolder } = trpc.folders.createFolder.useMutation({
    onError: (error) => {
      showToast({ description: error.message })
    },
    onSuccess: () => {
      refetchFolders()
    },
  })

  const { mutate: updateSniper } = trpc.sniper.updateSniper.useMutation({
    onError: (error) => {
      showToast({ description: error.message })
    },
    onSuccess: () => {
      refetchSnipers()
    },
  })

  const {
    snipers,
    isLoading: isSniperLoading,
    refetch: refetchSnipers,
  } = useSnipers({
    workspaceId: workspace?.id,
    folderId: folder === null ? 'root' : folder.id,
    onError: (error) => {
      showToast({
        description: error.message,
      })
    },
  })

  const moveSniperToFolder = async (sniperId: string, folderId: string) => {
    if (!snipers) return
    updateSniper({
      sniperId,
      sniper: {
        folderId: folderId === 'root' ? null : folderId,
      },
    })
  }

  const handleCreateFolder = () => {
    if (!folders || !workspace) return
    setIsCreatingFolder(true)
    createFolder({
      workspaceId: workspace.id,
      parentFolderId: folder?.id,
    })
    setIsCreatingFolder(false)
  }

  const handleMouseUp = async () => {
    if (mouseOverFolderId !== undefined && draggedSniper)
      await moveSniperToFolder(draggedSniper.id, mouseOverFolderId ?? 'root')
    setMouseOverFolderId(undefined)
    setDraggedSniper(undefined)
  }
  useEventListener('mouseup', handleMouseUp)

  const handleSniperDrag =
    (sniper: SniperInDashboard) =>
    ({ absolute, relative }: NodePosition) => {
      if (draggedSniper) return
      setMousePositionInElement(relative)
      setDraggablePosition({
        x: absolute.x - relative.x,
        y: absolute.y - relative.y,
      })
      setDraggedSniper(sniper)
    }

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedSniper) return
    const { clientX, clientY } = e
    setDraggablePosition({
      x: clientX - mousePositionInElement.x,
      y: clientY - mousePositionInElement.y,
    })
  }
  useEventListener('mousemove', handleMouseMove)

  useEffect(() => {
    if (!draggablePosition || !draggedSniper) return
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
  }, [draggablePosition, draggedSniper, mousePositionInElement])

  return (
    <Flex w="full" flex="1" justify="center">
      <Stack w="1000px" spacing={6} pt="4">
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
                isLoading={isSniperLoading}
                isFirstBot={snipers?.length === 0 && folder === null}
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
            {isSniperLoading && <ButtonSkeleton />}
            {snipers &&
              snipers.map((sniper) => (
                <SniperButton
                  key={sniper.id}
                  sniper={sniper}
                  draggedSniper={draggedSniper}
                  onSniperUpdated={refetchSnipers}
                  onDrag={handleSniperDrag(sniper)}
                />
              ))}
          </Wrap>
        </Stack>
      </Stack>
      {draggedSniper && (
        <Portal>
          <SniperCardOverlay
            sniper={draggedSniper}
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
