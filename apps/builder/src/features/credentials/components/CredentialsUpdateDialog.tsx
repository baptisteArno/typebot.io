import { UpdateStripeCredentialsDialogBody } from "@/features/blocks/inputs/payment/components/UpdateStripeCredentialsDialogBody";
import { SmtpCredentialsUpdateDialogBody } from "@/features/blocks/integrations/sendEmail/components/SmtpCredentialsUpdateDialogBody";
import { ForgedCredentialsUpdateDialogContent } from "@/features/forge/components/credentials/ForgedCredentialsUpdateDialogContent";
import { ForgedOAuthCredentialsUpdateDialogBody } from "@/features/forge/components/credentials/ForgedOAuthCredentialsUpdateDialogBody";
import type { Credentials } from "@typebot.io/credentials/schemas";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { Dialog } from "@typebot.io/ui/components/Dialog";

export const CredentialsUpdateDialog = ({
  editingCredentials,
  scope,
  isOpen,
  onSubmit,
  onClose,
}: {
  editingCredentials?: {
    id: string;
    type: Credentials["type"];
  };
  scope: "workspace" | "user";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      {editingCredentials && (
        <CredentialsUpdateDialogPopup
          editingCredentials={editingCredentials}
          onSubmit={onSubmit}
          scope={scope}
        />
      )}
    </Dialog.Root>
  );
};

const CredentialsUpdateDialogPopup = ({
  editingCredentials,
  scope,
  onSubmit,
}: {
  editingCredentials: {
    id: string;
    type: Credentials["type"];
  };
  scope: "workspace" | "user";
  onSubmit: () => void;
}) => {
  if (editingCredentials.type === "google sheets") return null;

  if (editingCredentials.type === "smtp")
    return (
      <SmtpCredentialsUpdateDialogBody
        credentialsId={editingCredentials.id}
        onUpdate={onSubmit}
      />
    );

  if (editingCredentials.type === "stripe")
    return (
      <UpdateStripeCredentialsDialogBody
        credentialsId={editingCredentials.id}
        onUpdate={onSubmit}
      />
    );

  if (
    editingCredentials.type === "whatsApp" ||
    editingCredentials.type === "http proxy"
  )
    return null;

  if (forgedBlocks[editingCredentials.type].auth?.type === "oauth")
    return (
      <ForgedOAuthCredentialsUpdateDialogBody
        credentialsId={editingCredentials.id}
        blockDef={forgedBlocks[editingCredentials.type]}
        onUpdate={onSubmit}
        scope={scope}
      />
    );

  return (
    <ForgedCredentialsUpdateDialogContent
      credentialsId={editingCredentials.id}
      blockDef={forgedBlocks[editingCredentials.type]}
      onUpdate={onSubmit}
      scope={scope}
    />
  );
};
