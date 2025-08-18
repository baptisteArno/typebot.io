import { ChevronLeftIcon } from "@/components/icons";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { toast } from "@/lib/toast";
import { Button, HStack, Input, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import { Menu } from "@typebot.io/ui/components/Menu";
import { type FormEvent, useState } from "react";
import { sendInvitationQuery } from "../queries/sendInvitationQuery";
import type { Member } from "../types";

type Props = {
  workspaceId: string;
  onNewMember: (member: Member) => void;
  onNewInvitation: (invitation: Prisma.WorkspaceInvitation) => void;
  isLoading: boolean;
  isLocked: boolean;
};
export const AddMemberForm = ({
  workspaceId,
  onNewMember,
  onNewInvitation,
  isLoading,
  isLocked,
}: Props) => {
  const { t } = useTranslate();
  const [invitationEmail, setInvitationEmail] = useState("");
  const [invitationRole, setInvitationRole] = useState<WorkspaceRole>(
    WorkspaceRole.MEMBER,
  );

  const [isSendingInvitation, setIsSendingInvitation] = useState(false);

  const handleInvitationSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSendingInvitation(true);
    const { data, error } = await sendInvitationQuery({
      email: invitationEmail,
      type: invitationRole,
      workspaceId,
    });
    if (error) {
      toast({
        description: error.message,
      });
    } else {
      setInvitationEmail("");
    }
    if (data?.member) onNewMember(data.member);
    if (data?.invitation) onNewInvitation(data.invitation);
    setIsSendingInvitation(false);
  };

  return (
    <HStack as="form" onSubmit={handleInvitationSubmit}>
      <Input
        placeholder={t("workspace.membersList.inviteInput.placeholder")}
        name="inviteEmail"
        value={invitationEmail}
        onChange={(e) => setInvitationEmail(e.target.value)}
        rounded="md"
        isDisabled={isLocked}
      />

      {!isLocked && (
        <WorkspaceRoleMenuButton
          role={invitationRole}
          onChange={setInvitationRole}
        />
      )}
      <Button
        colorScheme="orange"
        isLoading={isSendingInvitation}
        flexShrink={0}
        type="submit"
        isDisabled={isLoading || isLocked || invitationEmail === ""}
      >
        {t("workspace.membersList.inviteButton.label")}
      </Button>
    </HStack>
  );
};

const WorkspaceRoleMenuButton = ({
  role,
  onChange,
}: {
  role: WorkspaceRole;
  onChange: (role: WorkspaceRole) => void;
}) => {
  return (
    <BasicSelect
      items={[
        { label: "Admin", value: WorkspaceRole.ADMIN },
        { label: "Member", value: WorkspaceRole.MEMBER },
      ]}
      value={role}
      onChange={onChange}
    />
  );
};

export const convertWorkspaceRoleToReadable = (role: WorkspaceRole): string => {
  switch (role) {
    case WorkspaceRole.ADMIN:
      return "Admin";
    case WorkspaceRole.MEMBER:
      return "Member";
    case WorkspaceRole.GUEST:
      return "Guest";
  }
};
