import { useMutation, useQuery } from "@tanstack/react-query";
import type { Prisma } from "@typebot.io/prisma/types";
import { useEffect, useState } from "react";
import { Portal } from "@/components/Portal";
import { useTypebots } from "@/features/dashboard/hooks/useTypebots";
import type { TypebotInDashboard } from "@/features/dashboard/types";
import type { NodePosition } from "@/features/graph/providers/GraphDndProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useEventListener } from "@/hooks/useEventListener";
import { trpc } from "@/lib/queryClient";
import { useTypebotDnd } from "../TypebotDndProvider";
import { BackButton } from "./BackButton";
import { CreateBotButton } from "./CreateBotButton";
import { CreateFolderButton } from "./CreateFolderButton";
import FolderButton, { ButtonSkeleton } from "./FolderButton";
import TypebotButton from "./TypebotButton";
import { TypebotButtonOverlay } from "./TypebotButtonOverlay";

type Props = { folder: Prisma.DashboardFolder | null };

export const FolderContent = ({ folder }: Props) => {
  const { workspace, currentUserMode } = useWorkspace();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const {
    setDraggedTypebot,
    draggedTypebot,
    mouseOverFolderId,
    setMouseOverFolderId,
  } = useTypebotDnd();
  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  const [mousePositionInElement, setMousePositionInElement] = useState({
    x: 0,
    y: 0,
  });

  const {
    data: { folders } = {},
    isLoading: isFolderLoading,
    refetch: refetchFolders,
  } = useQuery(
    trpc.folders.listFolders.queryOptions(
      {
        workspaceId: workspace?.id as string,
        parentFolderId: folder?.id,
      },
      {
        enabled: !!workspace,
      },
    ),
  );

  const { mutate: createFolder } = useMutation(
    trpc.folders.createFolder.mutationOptions({
      onSuccess: () => {
        refetchFolders();
      },
    }),
  );

  const { mutate: updateTypebot } = useMutation(
    trpc.typebot.updateTypebot.mutationOptions({
      onSuccess: () => {
        refetchTypebots();
      },
    }),
  );

  const {
    typebots,
    isLoading: isTypebotLoading,
    refetch: refetchTypebots,
  } = useTypebots({
    workspaceId: workspace?.id,
    folderId: folder === null ? "root" : folder.id,
  });

  const moveTypebotToFolder = async (typebotId: string, folderId: string) => {
    if (!typebots) return;
    updateTypebot({
      typebotId,
      typebot: {
        folderId: folderId === "root" ? null : folderId,
      },
    });
  };

  const handleCreateFolder = () => {
    if (!folders || !workspace) return;
    setIsCreatingFolder(true);
    createFolder({
      workspaceId: workspace.id,
      parentFolderId: folder?.id,
    });
    setIsCreatingFolder(false);
  };

  const handleMouseUp = async () => {
    if (mouseOverFolderId !== undefined && draggedTypebot)
      await moveTypebotToFolder(draggedTypebot.id, mouseOverFolderId ?? "root");
    setMouseOverFolderId(undefined);
    setDraggedTypebot(undefined);
  };
  useEventListener("mouseup", handleMouseUp);

  const handleTypebotDrag =
    (typebot: TypebotInDashboard) =>
    ({ absolute, relative }: NodePosition) => {
      if (draggedTypebot) return;
      setMousePositionInElement(relative);
      setDraggablePosition({
        x: absolute.x - relative.x,
        y: absolute.y - relative.y,
      });
      setDraggedTypebot(typebot);
    };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggedTypebot) return;
    const { clientX, clientY } = e;
    setDraggablePosition({
      x: clientX - mousePositionInElement.x,
      y: clientY - mousePositionInElement.y,
    });
  };
  useEventListener("mousemove", handleMouseMove);

  useEffect(() => {
    if (!draggablePosition || !draggedTypebot) return;
    const { innerHeight } = window;
    const scrollSpeed = 10;
    const scrollMargin = 50;
    const clientY = draggablePosition.y + mousePositionInElement.y;
    const scrollY =
      clientY < scrollMargin
        ? -scrollSpeed
        : clientY > innerHeight - scrollMargin
          ? scrollSpeed
          : 0;
    window.scrollBy(0, scrollY);
    const interval = setInterval(() => {
      window.scrollBy(0, scrollY);
    }, 5);

    return () => {
      clearInterval(interval);
    };
  }, [draggablePosition, draggedTypebot, mousePositionInElement]);

  return (
    <div className="flex w-full flex-1 justify-center">
      <div className="flex flex-col w-[1000px] gap-6 pt-4">
        {folder?.name !== undefined ? (
          <h1 className="text-2xl font-medium">{folder.name}</h1>
        ) : null}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {folder && <BackButton id={folder.parentFolderId} />}
            {currentUserMode !== "guest" && (
              <CreateFolderButton
                onClick={handleCreateFolder}
                isLoading={isCreatingFolder || isFolderLoading}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {currentUserMode !== "guest" && (
              <CreateBotButton
                folderId={folder?.id}
                disabled={isTypebotLoading}
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
                  isReadOnly={
                    typebot.accessRight !== "write" &&
                    currentUserMode !== "write"
                  }
                />
              ))}
          </div>
        </div>
      </div>
      {draggedTypebot && (
        <Portal>
          <TypebotButtonOverlay
            typebot={draggedTypebot}
            onMouseUp={handleMouseUp}
            className="fixed top-0 left-0 origin-[0_0_0]"
            style={{
              transform: `translate(${draggablePosition.x}px, ${draggablePosition.y}px) rotate(-2deg)`,
            }}
          />
        </Portal>
      )}
    </div>
  );
};
