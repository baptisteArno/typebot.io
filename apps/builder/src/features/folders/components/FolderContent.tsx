import { useMutation, useQuery } from "@tanstack/react-query";
import { createId } from "@typebot.io/lib/createId";
import type { Prisma } from "@typebot.io/prisma/types";
import { cn } from "@typebot.io/ui/lib/cn";
import { Schema } from "effect";
import { useEffect, useState } from "react";
import { Portal } from "@/components/Portal";
import type { TypebotInDashboard } from "@/features/dashboard/types";
import type { NodePosition } from "@/features/graph/providers/GraphDndProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { useEventListener } from "@/hooks/useEventListener";
import { orpc, queryClient } from "@/lib/queryClient";
import { useTypebotDnd } from "../TypebotDndProvider";
import { BackButton } from "./BackButton";
import { CreateBotButton } from "./CreateBotButton";
import { CreateFolderButton } from "./CreateFolderButton";
import FolderButton, { ButtonSkeleton } from "./FolderButton";
import TypebotButton from "./TypebotButton";
import { TypebotButtonOverlay } from "./TypebotButtonOverlay";

type Props = { folder: Prisma.DashboardFolder | null };

const OptimisticFolderCreate = Schema.Struct({
  id: Schema.NonEmptyString,
  folderName: Schema.NonEmptyString,
});

export const FolderContent = ({ folder }: Props) => {
  const { workspace, currentUserMode } = useWorkspace();
  const {
    setDraggedTypebot,
    draggedTypebot,
    mouseOverFolderId,
    setMouseOverFolderId,
    mouseOverSpaceId,
    setMouseOverSpaceId,
  } = useTypebotDnd();

  const [draggablePosition, setDraggablePosition] = useState({ x: 0, y: 0 });
  const [mousePositionInElement, setMousePositionInElement] = useState({
    x: 0,
    y: 0,
  });
  const [newFolderId, setNewFolderId] = useState<string>();

  const {
    data: foldersData,
    isLoading: isFolderLoading,
    refetch: refetchFolders,
  } = useQuery(
    orpc.folders.listFolders.queryOptions({
      input: {
        workspaceId: workspace?.id as string,
        parentFolderId: folder?.id,
      },
      enabled: !!workspace,
    }),
  );

  const { mutate: createFolder, isPending: isCreatingFolder } = useMutation(
    orpc.folders.createFolder.mutationOptions({
      onMutate: (data) => {
        const result = Schema.decodeUnknownExit(OptimisticFolderCreate)(data);
        if (result._tag !== "Success") return;
        const newFolder = {
          id: result.value.id,
          name: result.value.folderName,
          createdAt: new Date(),
        };
        const listFoldersQueryKey = orpc.folders.listFolders.queryKey({
          input: {
            workspaceId: data.workspaceId,
            parentFolderId: data.parentFolderId,
          },
        });
        const cacheData =
          queryClient.getQueryData<typeof foldersData>(listFoldersQueryKey);

        queryClient.cancelQueries({ queryKey: listFoldersQueryKey });

        queryClient.setQueryData<typeof foldersData>(
          listFoldersQueryKey,
          (cache) => ({
            folders: [...(cache?.folders ?? []), newFolder].sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
            ),
          }),
        );
        return { previousCacheData: cacheData, key: listFoldersQueryKey };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousCacheData)
          queryClient.setQueryData(context.key, context.previousCacheData);
      },
      onSettled: () => {
        refetchFolders();
      },
    }),
  );
  const { mutate: patchTypebot } = useMutation(
    orpc.typebot.updateTypebot.mutationOptions({
      onMutate: (patchData) => {
        const currentFolderId = folder === null ? null : folder.id;
        const listTypebotsQueryKey = orpc.typebot.listTypebots.queryKey({
          input: {
            workspaceId: workspace?.id as string,
            folderId: folder === null ? "root" : folder.id,
          },
        });

        const cacheData =
          queryClient.getQueryData<typeof typebotsData>(listTypebotsQueryKey);

        queryClient.cancelQueries({ queryKey: listTypebotsQueryKey });

        queryClient.setQueryData<typeof typebotsData>(
          listTypebotsQueryKey,
          (cache) => ({
            typebots:
              cache?.typebots
                ?.filter((typebot) => {
                  if (typebot.id !== patchData.typebotId) return true;
                  if (patchData.typebot.folderId === undefined) return true;
                  return patchData.typebot.folderId === currentFolderId;
                })
                .map((typebot) =>
                  typebot.id === patchData.typebotId
                    ? {
                        ...typebot,
                        spaceId:
                          patchData.typebot.spaceId === undefined
                            ? typebot.spaceId
                            : patchData.typebot.spaceId,
                      }
                    : typebot,
                )
                .sort(
                  (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
                ) ?? [],
          }),
        );

        return { previousCacheData: cacheData, key: listTypebotsQueryKey };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousCacheData)
          queryClient.setQueryData(context.key, context.previousCacheData);
      },
      onSettled: () => {
        refetchTypebots();
      },
    }),
  );

  const {
    data: typebotsData,
    isLoading: isTypebotLoading,
    refetch: refetchTypebots,
  } = useQuery(
    orpc.typebot.listTypebots.queryOptions({
      input: {
        workspaceId: workspace?.id as string,
        folderId: folder === null ? "root" : folder.id,
      },
      enabled: !!workspace?.id,
    }),
  );

  const { data: spacesFeatureFlagData } = useQuery(
    orpc.featureFlags.isEnabled.queryOptions({
      input: { key: "spaces" },
    }),
  );

  const isSpacesEnabled = spacesFeatureFlagData?.enabled === true;

  const { data: spacesData } = useQuery(
    orpc.spaces.list.queryOptions({
      input: {
        workspaceId: workspace?.id ?? "",
      },
      enabled: isSpacesEnabled && !!workspace?.id && folder === null,
    }),
  );

  const handleMouseUp = async () => {
    if (mouseOverFolderId !== undefined && draggedTypebot)
      patchTypebot({
        typebotId: draggedTypebot.id,
        typebot: {
          folderId: mouseOverFolderId === "root" ? null : mouseOverFolderId,
        },
      });
    if (mouseOverSpaceId !== undefined && draggedTypebot)
      patchTypebot({
        typebotId: draggedTypebot.id,
        typebot: { spaceId: mouseOverSpaceId },
      });
    setMouseOverFolderId(undefined);
    setMouseOverSpaceId(undefined);
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
        {/* biome-ignore lint/a11y/noStaticElementInteractions: Drop zone for drag-and-drop, not a standalone interactive element. */}
        <div
          className={cn(
            "flex flex-col gap-2 rounded-lg p-4 border-2 border-transparent transition-colors",
            draggedTypebot &&
              draggedTypebot.spaceId !== null &&
              (mouseOverSpaceId === null
                ? "border-orange-8"
                : "border-dashed border-gray-7"),
          )}
          onMouseEnter={() => {
            if (draggedTypebot) setMouseOverSpaceId(null);
          }}
          onMouseLeave={() => setMouseOverSpaceId(undefined)}
        >
          <div className="flex items-center gap-2">
            {folder && <BackButton id={folder.parentFolderId} />}
            {currentUserMode !== "guest" && workspace && (
              <CreateFolderButton
                onClick={() => {
                  const id = createId();
                  setNewFolderId(id);
                  createFolder({
                    id,
                    folderName: "Untitled",
                    workspaceId: workspace.id,
                    parentFolderId: folder?.id ?? undefined,
                  });
                }}
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
            {workspace &&
              foldersData?.folders.map((folder) => (
                <FolderButton
                  key={folder.id}
                  isNameDefaultEditable={folder.id === newFolderId}
                  workspaceId={workspace?.id}
                  folder={folder}
                  onFolderDeleted={refetchFolders}
                  onFolderRenamed={() => refetchFolders()}
                />
              ))}
            {isTypebotLoading && <ButtonSkeleton />}
            {workspace &&
              typebotsData?.typebots
                ?.filter((typebot) => typebot.spaceId === null)
                .map((typebot) => (
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
        {folder === null &&
          spacesData?.spaces.map((space) => {
            const spaceTypebots = typebotsData?.typebots.filter(
              (typebot) => typebot.spaceId === space.id,
            );
            if (
              !draggedTypebot &&
              (!spaceTypebots || spaceTypebots.length === 0)
            )
              return null;
            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: Drop zone for drag-and-drop.
              <div
                key={space.id}
                className={cn(
                  "flex flex-col gap-4 rounded-lg p-4 border-2 border-transparent transition-colors",
                  draggedTypebot &&
                    draggedTypebot.spaceId !== space.id &&
                    (mouseOverSpaceId === space.id
                      ? "border-orange-8"
                      : "border-dashed border-gray-7"),
                  draggedTypebot &&
                    draggedTypebot.spaceId !== space.id &&
                    (!spaceTypebots || spaceTypebots.length === 0) &&
                    "min-h-24",
                )}
                onMouseEnter={() => {
                  if (draggedTypebot) setMouseOverSpaceId(space.id);
                }}
                onMouseLeave={() => setMouseOverSpaceId(undefined)}
              >
                <h2>{space.name}</h2>
                <div className="flex flex-wrap gap-4">
                  {spaceTypebots?.map((typebot) => (
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
            );
          })}
      </div>

      {draggedTypebot && (
        <Portal>
          <TypebotButtonOverlay
            typebot={draggedTypebot}
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
