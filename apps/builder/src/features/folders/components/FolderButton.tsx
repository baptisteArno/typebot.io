import { useMutation } from "@tanstack/react-query";
import { T, useTranslate } from "@tolgee/react";
import type { Prisma } from "@typebot.io/prisma/types";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button, buttonVariants } from "@typebot.io/ui/components/Button";
import { Menu } from "@typebot.io/ui/components/Menu";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { Folder01SolidIcon } from "@typebot.io/ui/icons/Folder01SolidIcon";
import { MoreVerticalIcon } from "@typebot.io/ui/icons/MoreVerticalIcon";
import { TriangleAlertIcon } from "@typebot.io/ui/icons/TriangleAlertIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRouter } from "next/router";
import { memo, useMemo } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SingleLineEditable } from "@/components/SingleLineEditable";
import { trpc } from "@/lib/queryClient";
import { useTypebotDnd } from "../TypebotDndProvider";

type Props = {
  folder: Prisma.DashboardFolder;
  index: number;
  onFolderDeleted: () => void;
  onFolderRenamed: () => void;
};

const FolderButton = ({
  folder,
  index,
  onFolderDeleted,
  onFolderRenamed,
}: Props) => {
  const { t } = useTranslate();
  const router = useRouter();
  const { draggedTypebot, setMouseOverFolderId, mouseOverFolderId } =
    useTypebotDnd();
  const isTypebotOver = useMemo(
    () => draggedTypebot && mouseOverFolderId === folder.id,
    [draggedTypebot, folder.id, mouseOverFolderId],
  );
  const deleteDialogControls = useOpenControls();
  const { mutate: deleteFolder } = useMutation(
    trpc.folders.deleteFolder.mutationOptions({
      onSuccess: onFolderDeleted,
    }),
  );

  const { mutate: updateFolder } = useMutation(
    trpc.folders.updateFolder.mutationOptions({
      onSuccess: onFolderRenamed,
    }),
  );

  const onRenameSubmit = async (newName: string) => {
    if (newName === "" || newName === folder.name) return;
    updateFolder({
      workspaceId: folder.workspaceId,
      folderId: folder.id,
      folder: {
        name: newName,
      },
    });
  };

  const handleClick = () => {
    router.push(`/typebots/folders/${folder.id}`);
  };

  const handleMouseEnter = () => setMouseOverFolderId(folder.id);
  const handleMouseLeave = () => setMouseOverFolderId(undefined);
  return (
    <>
      <div
        role="button"
        className={cn(
          buttonVariants({
            variant: "outline-secondary",
            iconStyle: "none",
            size: "lg",
          }),
          "w-[225px] h-[270px] relative px-6 whitespace-normal transition-all duration-100 justify-center bg-gray-1",
          isTypebotOver && "border-2 border-orange-8",
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Menu.Root>
          <Menu.TriggerButton
            aria-label={`Show ${folder.name} menu`}
            onClick={(e) => e.stopPropagation()}
            variant="outline-secondary"
            size="icon"
            className="absolute top-5 right-5 size-8"
          >
            <MoreVerticalIcon />
          </Menu.TriggerButton>
          <Menu.Popup align="end">
            <Menu.Item
              className="text-red-10"
              onClick={(e) => {
                e.stopPropagation();
                deleteDialogControls.onOpen();
              }}
            >
              {t("delete")}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Root>
        <div className="flex flex-col items-center gap-4">
          <Folder01SolidIcon className="size-10 text-blue-10" />
          <SingleLineEditable
            className="text-lg"
            defaultValue={folder.name === "" ? "New folder" : folder.name}
            onValueCommit={onRenameSubmit}
            defaultEdit={index === 0 && folder.name === ""}
            onClick={(e) => e.stopPropagation()}
            input={{
              className: "text-center",
            }}
            preview={{
              className: "cursor-text",
            }}
          />
        </div>
      </div>
      <ConfirmDialog
        confirmButtonLabel={t("delete")}
        title={`${t("delete")} ${folder.name}?`}
        onConfirm={() =>
          deleteFolder({
            workspaceId: folder.workspaceId,
            folderId: folder.id,
          })
        }
        actionType="destructive"
        isOpen={deleteDialogControls.isOpen}
        onClose={deleteDialogControls.onClose}
      >
        <div className="flex flex-col gap-4">
          <p>
            <T
              keyName="folders.folderButton.deleteConfirmationMessage"
              params={{
                strong: <strong>{folder.name}</strong>,
              }}
            />
          </p>
          <Alert.Root variant="warning">
            <TriangleAlertIcon />
            <Alert.Description>
              {t("folders.folderButton.deleteConfirmationMessageWarning")}
            </Alert.Description>
          </Alert.Root>
        </div>
      </ConfirmDialog>
    </>
  );
};

export const ButtonSkeleton = () => (
  <Button
    className="w-[225px] h-[270px] relative px-6 whitespace-normal"
    variant="outline-secondary"
  >
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col items-center gap-6 w-full">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="w-full h-2" />
        <Skeleton className="w-full h-2" />
      </div>
    </div>
  </Button>
);

export default memo(
  FolderButton,
  (prev, next) =>
    prev.folder.id === next.folder.id &&
    prev.index === next.index &&
    prev.folder.name === next.folder.name,
);
