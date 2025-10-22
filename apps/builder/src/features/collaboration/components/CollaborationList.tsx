import {
  Flex,
  HStack,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { CollaborationType } from "@typebot.io/prisma/enum";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Button } from "@typebot.io/ui/components/Button";
import { Input } from "@typebot.io/ui/components/Input";
import { HardDriveIcon } from "@typebot.io/ui/icons/HardDriveIcon";
import type { FormEvent } from "react";
import { useState } from "react";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { toast } from "@/lib/toast";
import { useCollaborators } from "../hooks/useCollaborators";
import { useInvitations } from "../hooks/useInvitations";
import { deleteCollaboratorQuery } from "../queries/deleteCollaboratorQuery";
import { deleteInvitationQuery } from "../queries/deleteInvitationQuery";
import { sendInvitationQuery } from "../queries/sendInvitationQuery";
import { updateCollaboratorQuery } from "../queries/updateCollaboratorQuery";
import { updateInvitationQuery } from "../queries/updateInvitationQuery";
import { CollaboratorItem } from "./CollaboratorButton";
import { ReadableCollaborationType } from "./ReadableCollaborationType";

type InvitationType = "READ" | "WRITE";

export const CollaborationList = () => {
  const { currentUserMode, workspace } = useWorkspace();
  const { t } = useTranslate();
  const { typebot } = useTypebot();
  const [invitationType, setInvitationType] = useState<InvitationType>("READ");
  const [invitationEmail, setInvitationEmail] = useState("");
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);

  const {
    collaborators,
    isLoading: isCollaboratorsLoading,
    mutate: mutateCollaborators,
  } = useCollaborators({
    typebotId: typebot?.id,
    onError: (e) =>
      toast({
        description: e.message,
      }),
  });
  const {
    invitations,
    isLoading: isInvitationsLoading,
    mutate: mutateInvitations,
  } = useInvitations({
    typebotId: typebot?.id,
    onError: (e) =>
      toast({
        title: t("share.button.popover.invitationsFetch.error.label"),
        description: e.message,
      }),
  });

  const handleChangeInvitationCollabType =
    (email: string) => async (type: CollaborationType) => {
      if (!typebot || currentUserMode === "guest") return;
      const { error } = await updateInvitationQuery(typebot?.id, email, {
        email,
        typebotId: typebot.id,
        type,
      });
      if (error)
        return toast({
          title: error.name,
          description: error.message,
        });
      mutateInvitations({
        invitations: (invitations ?? []).map((i) =>
          i.email === email ? { ...i, type } : i,
        ),
      });
    };
  const handleDeleteInvitation = (email: string) => async () => {
    if (!typebot || currentUserMode === "guest") return;
    const { error } = await deleteInvitationQuery(typebot?.id, email);
    if (error)
      return toast({
        title: error.name,
        description: error.message,
      });
    mutateInvitations({
      invitations: (invitations ?? []).filter((i) => i.email !== email),
    });
  };

  const handleChangeCollaborationType =
    (userId: string) => async (type: CollaborationType) => {
      if (!typebot || currentUserMode === "guest") return;
      const { error } = await updateCollaboratorQuery(typebot?.id, userId, {
        userId,
        type,
        typebotId: typebot.id,
      });
      if (error)
        return toast({
          title: error.name,
          description: error.message,
        });
      mutateCollaborators({
        collaborators: (collaborators ?? []).map((c) =>
          c.userId === userId ? { ...c, type } : c,
        ),
      });
    };
  const handleDeleteCollaboration = (userId: string) => async () => {
    if (!typebot || currentUserMode === "guest") return;
    const { error } = await deleteCollaboratorQuery(typebot?.id, userId);
    if (error)
      return toast({
        title: error.name,
        description: error.message,
      });
    mutateCollaborators({
      collaborators: (collaborators ?? []).filter((c) => c.userId !== userId),
    });
  };

  const handleInvitationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!typebot || currentUserMode === "guest") return;
    setIsSendingInvitation(true);
    const { error } = await sendInvitationQuery(typebot.id, {
      email: invitationEmail,
      type: invitationType,
    });
    setIsSendingInvitation(false);
    mutateInvitations({ invitations: invitations ?? [] });
    mutateCollaborators({ collaborators: collaborators ?? [] });
    if (error)
      return toast({
        title: error.name,
        description: error.message,
      });
    toast({
      type: "success",
      description: t("share.button.popover.invitationSent.successToast.label"),
    });
    setInvitationEmail("");
  };

  const updateInvitationType = (type: InvitationType) => {
    setInvitationType(type);
  };

  return (
    <Stack spacing={1} pt="4">
      <HStack as="form" onSubmit={handleInvitationSubmit} px="4" pb="2">
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
      </HStack>
      {workspace && (
        <Flex py="2" px="4" justifyContent="space-between" alignItems="center">
          <HStack minW={0} spacing={3}>
            <EmojiOrImageIcon
              icon={workspace.icon}
              defaultIcon={HardDriveIcon}
            />
            <Text fontSize="15px" noOfLines={1}>
              Everyone at {workspace.name}
            </Text>
          </HStack>
          <Badge className="flex-shrink-0">
            <ReadableCollaborationType type={CollaborationType.FULL_ACCESS} />
          </Badge>
        </Flex>
      )}
      {invitations?.map(({ email, type }) => (
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
      {collaborators?.map(({ user, type, userId }) => (
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
        <HStack p="4" justifyContent="space-between">
          <HStack>
            <SkeletonCircle boxSize="32px" />
            <Stack>
              <Skeleton width="130px" h="6px" />
              <Skeleton width="200px" h="6px" />
            </Stack>
          </HStack>
          <Skeleton width="80px" h="10px" />
        </HStack>
      )}
    </Stack>
  );
};
