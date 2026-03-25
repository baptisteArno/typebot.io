import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { getSeatsLimit } from "@typebot.io/billing/helpers/getSeatsLimit";
import { createId } from "@typebot.io/lib/createId";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { EmptySpaceState } from "@typebot.io/spaces/react/EmptySpaceState";
import { SpacesTable } from "@typebot.io/spaces/react/SpacesTable";
import { Alert } from "@typebot.io/ui/components/Alert";
import { AlertDialog } from "@typebot.io/ui/components/AlertDialog";
import { Button } from "@typebot.io/ui/components/Button";
import { Kbd } from "@typebot.io/ui/components/Kbd";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { Tabs } from "@typebot.io/ui/components/Tabs";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { useState } from "react";
import { ChangePlanDialog } from "@/features/billing/components/ChangePlanDialog";
import { useUser } from "@/features/user/hooks/useUser";
import { compressFile } from "@/helpers/compressFile";
import { orpc, queryClient } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useWorkspace } from "../WorkspaceProvider";
import { AddMemberForm } from "./AddMemberForm";
import { MemberItem } from "./MemberItem";

export const PeopleList = () => {
  const [currentTab, setCurrentTab] = useState("members");
  const { workspace } = useWorkspace();
  const { data: spacesFeatureFlagData } = useQuery(
    orpc.featureFlags.isEnabled.queryOptions({
      input: { key: "spaces" },
    }),
  );
  const { data: membersData, isLoading: isMembersCountLoading } = useQuery(
    orpc.workspace.listMembersInWorkspace.queryOptions({
      input: { workspaceId: workspace?.id ?? "" },
      enabled: !!workspace?.id,
    }),
  );
  const { data: invitationsData, isLoading: isInvitationsCountLoading } =
    useQuery(
      orpc.workspace.listInvitationsInWorkspace.queryOptions({
        input: { workspaceId: workspace?.id ?? "" },
        enabled: !!workspace?.id,
      }),
    );
  const membersListedTotal =
    (membersData?.members.length ?? 0) +
    (invitationsData?.invitations.length ?? 0);
  const isMembersTabCountLoading =
    isMembersCountLoading || isInvitationsCountLoading;
  const isSpacesTabVisible = spacesFeatureFlagData?.enabled === true;
  const displayedTab =
    !isSpacesTabVisible && currentTab === "spaces" ? "members" : currentTab;

  return (
    <Tabs.Root value={displayedTab} onValueChange={setCurrentTab}>
      <Tabs.List>
        <Tabs.Tab value="members">
          Members
          {workspace?.id ? (
            <span className="text-muted-foreground tabular-nums">
              {isMembersTabCountLoading ? "…" : membersListedTotal}
            </span>
          ) : null}
        </Tabs.Tab>
        {isSpacesTabVisible && <Tabs.Tab value="spaces">Spaces</Tabs.Tab>}
      </Tabs.List>
      <Tabs.Panel value="members">
        <MembersList />
      </Tabs.Panel>
      {isSpacesTabVisible && (
        <Tabs.Panel value="spaces">
          <SpacesList isEnabled={displayedTab === "spaces"} />
        </Tabs.Panel>
      )}
    </Tabs.Root>
  );
};

const SpacesList = ({ isEnabled }: { isEnabled: boolean }) => {
  const { workspace } = useWorkspace();
  const [lastCreatedSpaceId, setLastCreatedSpaceId] = useState<string>();
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

  const { mutate: createSpace } = useMutation(
    orpc.spaces.create.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.spaces.list.key(),
        });
      },
    }),
  );

  const { mutateAsync: patchSpace } = useMutation(
    orpc.spaces.patch.mutationOptions({
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { mutate: deleteSpace } = useMutation(
    orpc.spaces.delete.mutationOptions({
      onMutate: (data) => {
        const queryKey = orpc.spaces.list.key();
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

  const createDefaultSpace = () => {
    if (!workspace?.id) return;
    const id = createId();
    setLastCreatedSpaceId(id);
    createSpace({
      workspaceId: workspace.id,
      id,
      name: "My space",
    });
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
    return <EmptySpaceState onCreateClick={createDefaultSpace} />;

  const deletingSpaceName = spacesData?.spaces.find(
    (s) => s.id === deletingSpaceId,
  )?.name;

  return (
    <>
      <SpacesTable
        spaces={spacesData?.spaces ?? []}
        defaultEditableSpaceId={lastCreatedSpaceId}
        onSpaceUpdate={async (space) => {
          await patchSpace({
            workspaceId: workspace.id,
            spaceId: space.id,
            name: space.name,
            icon: space.icon,
          });
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
          const formData = new FormData();
          Object.entries(data.formData).forEach(([key, value]) => {
            formData.append(key, value);
          });
          formData.append("file", file);
          const upload = await fetch(data.presignedUrl, {
            method: "POST",
            body: formData,
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

const MembersList = () => {
  const { user } = useUser();
  const { workspace, currentUserMode } = useWorkspace();
  const { t } = useTranslate();

  const {
    isOpen: isChangePlanDialogOpen,
    onOpen: onChangePlanDialogOpen,
    onClose: onChangePlanDialogClose,
  } = useOpenControls();

  const {
    data: membersData,
    refetch: refetchMembers,
    isLoading: isMembersLoading,
  } = useQuery(
    orpc.workspace.listMembersInWorkspace.queryOptions({
      input: { workspaceId: workspace?.id ?? "" },
      enabled: !!workspace?.id,
    }),
  );

  const {
    data: invitationsData,
    refetch: refetchInvitations,
    isLoading: isInvitationsLoading,
  } = useQuery(
    orpc.workspace.listInvitationsInWorkspace.queryOptions({
      input: { workspaceId: workspace?.id ?? "" },
      enabled: !!workspace?.id,
    }),
  );

  const members = membersData?.members ?? [];
  const invitations = invitationsData?.invitations ?? [];
  const isLoading = isMembersLoading || isInvitationsLoading;

  const refetch = () => {
    refetchMembers();
    refetchInvitations();
  };

  const { mutate: updateMember } = useMutation(
    orpc.workspace.updateWorkspaceMember.mutationOptions({
      onSuccess: () => refetch(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { mutate: deleteInvitation } = useMutation(
    orpc.workspace.deleteWorkspaceInvitation.mutationOptions({
      onSuccess: () => refetch(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { mutate: updateInvitation } = useMutation(
    orpc.workspace.updateWorkspaceInvitation.mutationOptions({
      onSuccess: () => refetch(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const handleDeleteMemberClick = (memberId: string) => () => {
    if (!workspace) return;
    deleteMember({ workspaceId: workspace.id, memberId });
  };

  const handleSelectNewRole = (memberId: string) => (role: WorkspaceRole) => {
    if (!workspace) return;
    updateMember({ workspaceId: workspace.id, memberId, role });
  };

  const handleDeleteInvitationClick = (id: string) => () => {
    if (!workspace) return;
    deleteInvitation({ id });
  };

  const handleSelectNewInvitationRole =
    (id: string) => (type: WorkspaceRole) => {
      if (!workspace) return;
      updateInvitation({ id, type });
    };

  const { mutate: deleteMember } = useMutation(
    orpc.workspace.deleteWorkspaceMember.mutationOptions({
      onSuccess: () => refetch(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { canInviteNewMember } = useSeatsLimit();

  return (
    <div className="flex flex-col gap-4">
      {!canInviteNewMember && (
        <Alert.Root>
          <InformationSquareIcon />
          <Alert.Title>Unlock more members</Alert.Title>
          <Alert.Description>
            {t("workspace.membersList.unlockBanner.label")}
          </Alert.Description>
          <Alert.Action>
            <Button
              variant="secondary"
              onClick={onChangePlanDialogOpen}
              size="sm"
            >
              Upgrade
            </Button>
            <ChangePlanDialog
              isOpen={isChangePlanDialogOpen}
              onClose={onChangePlanDialogClose}
            />
          </Alert.Action>
        </Alert.Root>
      )}
      {workspace?.id && currentUserMode === "write" && (
        <AddMemberForm
          workspaceId={workspace.id}
          onSuccess={refetch}
          isLoading={isLoading}
          isLocked={!canInviteNewMember}
        />
      )}
      {members.map((member) => (
        <MemberItem
          key={member.userId}
          email={member.user.email ?? ""}
          image={member.user.image ?? undefined}
          name={member.user.name ?? undefined}
          role={member.role}
          isMe={member.userId === user?.id}
          onDeleteClick={handleDeleteMemberClick(member.userId)}
          onSelectNewRole={handleSelectNewRole(member.userId)}
          canEdit={currentUserMode === "write"}
        />
      ))}
      {invitations.map((invitation) => (
        <MemberItem
          key={invitation.email}
          email={invitation.email ?? ""}
          role={invitation.type}
          onDeleteClick={handleDeleteInvitationClick(invitation.id)}
          onSelectNewRole={handleSelectNewInvitationRole(invitation.id)}
          isGuest
          canEdit={currentUserMode === "write"}
        />
      ))}
      {isLoading && (
        <div className="flex items-center gap-2 py-4">
          <Skeleton className="size-12 rounded-full" />
          <Skeleton className="w-40 h-2" />
          <Skeleton className="w-40 h-2" />
        </div>
      )}
    </div>
  );
};

const useSeatsLimit = () => {
  const { workspace } = useWorkspace();

  const { data: membersData } = useQuery(
    orpc.workspace.listMembersInWorkspace.queryOptions({
      input: { workspaceId: workspace?.id ?? "" },
      enabled: !!workspace?.id,
    }),
  );

  const { data: invitationsData } = useQuery(
    orpc.workspace.listInvitationsInWorkspace.queryOptions({
      input: { workspaceId: workspace?.id ?? "" },
      enabled: !!workspace?.id,
    }),
  );

  const members = membersData?.members ?? [];
  const invitations = invitationsData?.invitations ?? [];

  const membersCount =
    members.filter((member) => member.role !== WorkspaceRole.GUEST).length +
    invitations.length;

  const seatsLimit = workspace ? getSeatsLimit(workspace) : undefined;

  return {
    membersCount,
    seatsLimit,
    canInviteNewMember:
      seatsLimit === "inf"
        ? true
        : seatsLimit
          ? membersCount < seatsLimit
          : false,
  };
};
