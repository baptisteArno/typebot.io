import { ORPCError } from "@orpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SpaceIcon, SpaceName } from "@typebot.io/spaces/domain";
import { EmptySpaceState } from "@typebot.io/spaces/react/EmptySpaceState";
import { SpacesTable } from "@typebot.io/spaces/react/SpacesTable";
import { AlertDialog } from "@typebot.io/ui/components/AlertDialog";
import { Kbd } from "@typebot.io/ui/components/Kbd";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { Schema } from "effect";
import { useState } from "react";
import { compressFile } from "@/helpers/compressFile";
import { orpc, queryClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useWorkspace } from "../WorkspaceProvider";

const OptimisticSpacePatch = Schema.Struct({
  name: Schema.optional(SpaceName),
  icon: Schema.optional(Schema.NullOr(SpaceIcon)),
});

type Props = {
  isEnabled: boolean;
  lastCreatedSpaceId: string | undefined;
  onCreateClick: () => void;
};

export const SpacesList = ({
  isEnabled,
  lastCreatedSpaceId,
  onCreateClick,
}: Props) => {
  const { workspace } = useWorkspace();

  const [deletingSpaceId, setDeletingSpaceId] = useState<string>();

  const {
    data: spacesData,
    isLoading,
    refetch: refetchSpaces,
  } = useQuery(
    orpc.spaces.list.queryOptions({
      input: { workspaceId: workspace?.id ?? "" },
      enabled: isEnabled && !!workspace?.id,
    }),
  );

  const { mutateAsync: patchSpace } = useMutation(
    orpc.spaces.patch.mutationOptions({
      retry: (failureCount, error) =>
        error instanceof ORPCError &&
        error.code === "NOT_FOUND" &&
        failureCount < 2,
      onMutate: (data) => {
        const result = Schema.decodeUnknownExit(OptimisticSpacePatch)(data);
        if (result._tag !== "Success") return;
        const patch = result.value;
        const queryKey = orpc.spaces.list.queryKey({
          input: { workspaceId: data.workspaceId },
        });
        const cacheData = queryClient.getQueryData<typeof spacesData>(queryKey);
        if (!cacheData) return;
        queryClient.cancelQueries({ queryKey });
        queryClient.setQueryData<typeof spacesData>(queryKey, (cache) => ({
          spaces: (cache?.spaces ?? []).map((space) =>
            space.id === data.spaceId ? { ...space, ...patch } : space,
          ),
        }));
        return { previousCacheData: cacheData, key: queryKey };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousCacheData) {
          queryClient.setQueryData(context.key, context.previousCacheData);
        }
      },
      onSettled: () => {
        refetchSpaces();
      },
    }),
  );

  const { mutate: deleteSpace } = useMutation(
    orpc.spaces.delete.mutationOptions({
      onMutate: (data) => {
        const queryKey = orpc.spaces.list.queryKey({
          input: { workspaceId: data.workspaceId },
        });
        const cacheData = queryClient.getQueryData<typeof spacesData>(queryKey);
        if (!cacheData) return;
        queryClient.cancelQueries({ queryKey });
        queryClient.setQueryData<typeof spacesData>(queryKey, (cache) => ({
          spaces: (cache?.spaces ?? []).filter(
            (space) => space.id !== data.spaceId,
          ),
        }));
        return { previousCacheData: cacheData, key: queryKey };
      },
      onError: (_error, _variables, context) => {
        if (context?.previousCacheData) {
          queryClient.setQueryData(context.key, context.previousCacheData);
        }
      },
      onSettled: () => {
        refetchSpaces();
      },
    }),
  );

  const handleDeleteSpace = () => {
    if (!workspace?.id || !deletingSpaceId) return;
    deleteSpace({ workspaceId: workspace.id, spaceId: deletingSpaceId });
    setDeletingSpaceId(undefined);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Skeleton className="size-12 rounded-full" />
        <Skeleton className="w-40 h-2" />
      </div>
    );
  }

  if (!workspace?.id) return null;

  if (spacesData?.spaces.length === 0)
    return <EmptySpaceState onCreateClick={onCreateClick} />;

  const deletingSpaceName = spacesData?.spaces.find(
    (s) => s.id === deletingSpaceId,
  )?.name;

  return (
    <>
      <SpacesTable
        spaces={spacesData?.spaces ?? []}
        defaultEditableSpaceId={lastCreatedSpaceId}
        onSpaceUpdate={async (space) => {
          try {
            await patchSpace({
              workspaceId: workspace.id,
              spaceId: space.id,
              name: space.name,
              icon: space.icon,
            });
          } catch (error) {
            if (error instanceof Error) {
              toast({
                title: error.name,
                description: error.message,
              });
            }
          }
        }}
        onSpaceDelete={(spaceId) => setDeletingSpaceId(spaceId)}
        onFileUploadRequest={async (rawFile, spaceId) => {
          const file = await compressFile(rawFile);
          const data = await orpc.generateUploadUrl.call({
            filePathProps: {
              workspaceId: workspace.id,
              spaceId,
              fileName: "icon",
            },
            fileType: file.type,
          });
          const upload = await fetch(data.presignedUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
              "Cache-Control": "public, max-age=86400",
            },
          });
          if (!upload.ok) {
            toast({
              description: "Error while trying to upload the file.",
            });
            return null;
          }
          return `${data.fileUrl}?v=${Date.now()}`;
        }}
      />
      <AlertDialog.Root
        isOpen={deletingSpaceId !== undefined}
        onClose={() => setDeletingSpaceId(undefined)}
      >
        <AlertDialog.Content
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleDeleteSpace();
            }
          }}
        >
          <AlertDialog.Header>
            <AlertDialog.Title>Delete space</AlertDialog.Title>
            <AlertDialog.Description>
              Are you sure you want to delete{" "}
              <strong>{deletingSpaceName ?? "this space"}</strong>?
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>
              Cancel
              <Kbd.Key>Esc</Kbd.Key>
            </AlertDialog.Cancel>
            <AlertDialog.Action
              variant="destructive"
              size="sm"
              onClick={handleDeleteSpace}
            >
              Delete space
              <Kbd.Group>
                <Kbd.Key className="text-destructive-foreground/90 bg-destructive">
                  ⌘
                </Kbd.Key>
                <Kbd.Key className="text-destructive-foreground/90 bg-destructive">
                  ↩
                </Kbd.Key>
              </Kbd.Group>
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
};
