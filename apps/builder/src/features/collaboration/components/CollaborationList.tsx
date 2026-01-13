import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { CollaborationType } from "@typebot.io/prisma/enum";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { Input } from "@typebot.io/ui/components/Input";
import { Skeleton } from "@typebot.io/ui/components/Skeleton";
import { HardDriveIcon } from "@typebot.io/ui/icons/HardDriveIcon";
import type { FormEvent } from "react";
import { useState } from "react";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { orpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";
import { CollaboratorItem } from "./CollaboratorButton";
import { ReadableCollaborationType } from "./ReadableCollaborationType";

type InvitationType = "READ" | "WRITE";

export const CollaborationList = () => {
  const { currentUserMode, workspace } = useWorkspace();
  const { t } = useTranslate();
  const { typebot } = useTypebot();
  const [invitationType, setInvitationType] = useState<InvitationType>("READ");
  const [invitationEmail, setInvitationEmail] = useState("");

  const {
    data: collaboratorsData,
    refetch: refetchCollaborators,
    isLoading: isCollaboratorsLoading,
  } = useQuery(
    orpc.collaborators.getCollaborators.queryOptions({
      input: { typebotId: typebot?.id ?? "" },
      enabled: !!typebot?.id,
    }),
  );

  const {
    data: invitationsData,
    refetch: refetchInvitations,
    isLoading: isInvitationsLoading,
  } = useQuery(
    orpc.collaborators.listInvitations.queryOptions({
      input: { typebotId: typebot?.id ?? "" },
      enabled: !!typebot?.id,
    }),
  );

  const { mutate: updateInvitation } = useMutation(
    orpc.collaborators.updateInvitation.mutationOptions({
      onSuccess: () => refetchInvitations(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { mutate: deleteInvitation } = useMutation(
    orpc.collaborators.deleteInvitation.mutationOptions({
      onSuccess: () => refetchInvitations(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { mutate: updateCollaborator } = useMutation(
    orpc.collaborators.updateCollaborator.mutationOptions({
      onSuccess: () => refetchCollaborators(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { mutate: deleteCollaborator } = useMutation(
    orpc.collaborators.deleteCollaborator.mutationOptions({
      onSuccess: () => refetchCollaborators(),
      onError: (error) =>
        toast({
          title: error.name,
          description: error.message,
        }),
    }),
  );

  const { mutate: createInvitation, isPending: isSendingInvitation } =
    useMutation(
      orpc.collaborators.createInvitation.mutationOptions({
        onSuccess: () => {
          refetchInvitations();
          refetchCollaborators();
          toast({
            type: "success",
            description: t(
              "share.button.popover.invitationSent.successToast.label",
            ),
          });
          setInvitationEmail("");
        },
        onError: (error) =>
          toast({
            title: error.name,
            description: error.message,
          }),
      }),
    );

  const handleChangeInvitationCollabType =
    (email: string) => (type: CollaborationType) => {
      if (!typebot || currentUserMode === "guest") return;
      updateInvitation({ email, typebotId: typebot.id, type });
    };

  const handleDeleteInvitation = (email: string) => () => {
    if (!typebot || currentUserMode === "guest") return;
    deleteInvitation({ typebotId: typebot.id, email });
  };

  const handleChangeCollaborationType =
    (userId: string) => (type: CollaborationType) => {
      if (!typebot || currentUserMode === "guest") return;
      updateCollaborator({ typebotId: typebot.id, userId, type });
    };

  const handleDeleteCollaboration = (userId: string) => () => {
    if (!typebot || currentUserMode === "guest") return;
    deleteCollaborator({ typebotId: typebot.id, userId });
  };

  const handleInvitationSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!typebot || currentUserMode === "guest") return;
    createInvitation({
      typebotId: typebot.id,
      email: invitationEmail,
      type: invitationType,
    });
  };

  const updateInvitationType = (type: InvitationType) => {
    setInvitationType(type);
  };

  return (
    <div className="flex flex-col gap-1 pt-4">
      <form
        className="flex items-center gap-2 px-4 pb-2"
        onSubmit={handleInvitationSubmit}
      >
        <Input
          size="sm"
          placeholder={t("share.button.popover.inviteInput.placeholder")}
          name="inviteEmail"
          value={invitationEmail}
          onValueChange={setInvitationEmail}
          disabled={currentUserMode === "guest"}
        />

        {currentUserMode !== "guest" && (
          <BasicSelect
            size="sm"
            value={invitationType}
            onChange={updateInvitationType}
            items={[
              { label: "Read", value: CollaborationType.READ },
              { label: "Write", value: CollaborationType.WRITE },
            ]}
          />
        )}
        <Button
          size="sm"
          disabled={currentUserMode === "guest" || isSendingInvitation}
          type="submit"
        >
          {t("share.button.popover.inviteButton.label")}
        </Button>
      </form>
      {workspace && (
        <div className="flex py-2 px-4 justify-between items-center">
          <div className="flex items-center min-w-0 gap-3">
            <EmojiOrImageIcon
              icon={workspace.icon}
              defaultIcon={HardDriveIcon}
            />
            <p className="text-[15px] truncate">Everyone at {workspace.name}</p>
          </div>
          <Badge className="shrink-0">
            <ReadableCollaborationType type={CollaborationType.FULL_ACCESS} />
          </Badge>
        </div>
      )}
      {invitationsData?.invitations.map(({ email, type }) => (
        <CollaboratorItem
          key={email}
          email={email}
          type={type}
          isOwner={currentUserMode !== "guest"}
          onDeleteClick={handleDeleteInvitation(email)}
          onChangeCollaborationType={handleChangeInvitationCollabType(email)}
          isGuest
        />
      ))}
      {collaboratorsData?.collaborators.map(({ user, type, userId }) => (
        <CollaboratorItem
          key={userId}
          email={user.email ?? ""}
          image={user.image ?? undefined}
          name={user.name ?? undefined}
          type={type}
          isOwner={currentUserMode !== "guest"}
          onDeleteClick={handleDeleteCollaboration(userId ?? "")}
          onChangeCollaborationType={handleChangeCollaborationType(userId)}
        />
      ))}
      {(isCollaboratorsLoading || isInvitationsLoading) && (
        <div className="flex items-center gap-2 p-4 justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="w-32 h-1" />
              <Skeleton className="w-40 h-1" />
            </div>
          </div>
          <Skeleton className="w-20 h-2" />
        </div>
      )}
    </div>
  );
};
