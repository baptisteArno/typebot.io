import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { getSeatsLimit } from "@typebot.io/billing/helpers/getSeatsLimit";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Button } from "@typebot.io/ui/components/Button";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { ChangePlanDialog } from "@/features/billing/components/ChangePlanDialog";
import { useUser } from "@/features/user/hooks/useUser";
import { orpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { useWorkspace } from "../WorkspaceProvider";
import { AddMemberForm } from "./AddMemberForm";
import { MemberItem } from "./MemberItem";

export const PeopleList = () => {
  return <MembersList />;
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
