import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { TickIcon } from "@typebot.io/ui/icons/TickIcon";
import { Undo03Icon } from "@typebot.io/ui/icons/Undo03Icon";
import { Upload01Icon } from "@typebot.io/ui/icons/Upload01Icon";
import { useState } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  orpc,
  queryClient,
  showHttpRequestErrorToast,
} from "@/lib/queryClient";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const VersionHistoryDialog = ({ isOpen, onClose }: Props) => {
  const { typebot, activeVersion, restoreTypebotVersion, currentUserMode } =
    useTypebot();
  const [loadingVersionNumber, setLoadingVersionNumber] = useState<
    number | null
  >(null);

  const { data, isLoading } = useQuery(
    orpc.typebot.listTypebotVersions.queryOptions({
      input: { typebotId: typebot?.id as string },
      enabled: isOpen && !!typebot?.id,
    }),
  );

  const { mutate: publishTypebotVersion, status } = useMutation(
    orpc.typebot.publishTypebotVersion.mutationOptions({
      onError: (error) =>
        showHttpRequestErrorToast(error, {
          context: "Error while publishing version",
        }),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orpc.typebot.getPublishedTypebot.key(),
          }),
          queryClient.invalidateQueries({
            queryKey: orpc.typebot.listTypebotVersions.key(),
          }),
        ]);
      },
    }),
  );

  const handleRestoreToDraft = async (versionNumber: number) => {
    if (!typebot?.id) return;
    setLoadingVersionNumber(versionNumber);
    try {
      const { version } = await queryClient.fetchQuery(
        orpc.typebot.getTypebotVersion.queryOptions({
          input: {
            typebotId: typebot.id,
            versionNumber,
          },
        }),
      );
      restoreTypebotVersion(version);
      onClose();
    } catch (err) {
      showHttpRequestErrorToast(
        err instanceof Error ? err : new Error("Unknown error"),
        {
          context: "Error while restoring version",
        },
      );
    } finally {
      setLoadingVersionNumber(null);
    }
  };

  const handlePublishVersion = (versionNumber: number) => {
    if (!typebot?.id) return;
    publishTypebotVersion({
      typebotId: typebot.id,
      versionNumber,
    });
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-2xl">
        <Dialog.Title>Version history</Dialog.Title>
        <Dialog.CloseButton />
        <div className="flex flex-col divide-y rounded-md border">
          {isLoading ? (
            <div className="px-4 py-6 text-sm text-gray-11">
              Loading versions...
            </div>
          ) : data?.versions.length ? (
            data.versions.map((version) => {
              const isActive =
                version.isActive || version.id === activeVersion?.id;
              return (
                <div
                  key={version.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
                >
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Version {version.versionNumber}
                      </span>
                      {isActive && (
                        <Badge colorScheme="green">
                          <TickIcon />
                          Active
                        </Badge>
                      )}
                    </div>
                    <span className="truncate text-sm text-gray-11">
                      {version.createdAt.toLocaleString()} - Engine{" "}
                      {version.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={
                        loadingVersionNumber === version.versionNumber ||
                        Number(version.version) < 6
                      }
                      onClick={() =>
                        handleRestoreToDraft(version.versionNumber)
                      }
                    >
                      <Undo03Icon />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      disabled={
                        isActive ||
                        currentUserMode !== "write" ||
                        status === "pending"
                      }
                      onClick={() =>
                        handlePublishVersion(version.versionNumber)
                      }
                    >
                      <Upload01Icon />
                      Publish
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-sm text-gray-11">
              No versions yet.
            </div>
          )}
        </div>
        <Dialog.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
