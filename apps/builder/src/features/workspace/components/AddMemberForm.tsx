import { HStack, Input } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import { Button } from "@typebot.io/ui/components/Button";
import { type FormEvent, useState } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { toast } from "@/lib/toast";
import { sendInvitationQuery } from "../queries/sendInvitationQuery";
import type { Member } from "../types";

type InvitationRole = "ADMIN" | "MEMBER";
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
  const [invitationRole, setInvitationRole] = useState<InvitationRole>(
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
        type="submit"
        disabled={
          isLoading || isLocked || invitationEmail === "" || isSendingInvitation
        }
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
  role: InvitationRole;
  onChange: (role: InvitationRole) => void;
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
