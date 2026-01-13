import { useMutation } from "@tanstack/react-query";
import { useTranslate } from "@tolgee/react";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { Button } from "@typebot.io/ui/components/Button";
import { Input } from "@typebot.io/ui/components/Input";
import { type FormEvent, useState } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { orpc } from "@/lib/queryClient";
import { toast } from "@/lib/toast";

type InvitationRole = "ADMIN" | "MEMBER";
type Props = {
  workspaceId: string;
  onSuccess: () => void;
  isLoading: boolean;
  isLocked: boolean;
};
export const AddMemberForm = ({
  workspaceId,
  onSuccess,
  isLoading,
  isLocked,
}: Props) => {
  const { t } = useTranslate();
  const [invitationEmail, setInvitationEmail] = useState("");
  const [invitationRole, setInvitationRole] = useState<InvitationRole>(
    WorkspaceRole.MEMBER,
  );

  const { mutate: createInvitation, isPending: isSendingInvitation } =
    useMutation(
      orpc.workspace.createWorkspaceInvitation.mutationOptions({
        onSuccess: () => {
          onSuccess();
          setInvitationEmail("");
        },
        onError: (error) =>
          toast({
            title: error.name,
            description: error.message,
          }),
      }),
    );

  const handleInvitationSubmit = (e: FormEvent) => {
    e.preventDefault();
    createInvitation({
      email: invitationEmail,
      type: invitationRole,
      workspaceId,
    });
  };

  return (
    <form className="flex items-center gap-2" onSubmit={handleInvitationSubmit}>
      <Input
        placeholder={t("workspace.membersList.inviteInput.placeholder")}
        name="inviteEmail"
        value={invitationEmail}
        onValueChange={setInvitationEmail}
        disabled={isLocked}
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
    </form>
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
