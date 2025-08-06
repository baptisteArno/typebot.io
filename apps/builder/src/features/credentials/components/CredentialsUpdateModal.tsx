import { UpdateStripeCredentialsModalContent } from "@/features/blocks/inputs/payment/components/UpdateStripeCredentialsModalContent";
import { SmtpUpdateModalContent } from "@/features/blocks/integrations/sendEmail/components/SmtpUpdateModalContent";
import { UpdateForgedCredentialsModalContent } from "@/features/forge/components/credentials/UpdateForgedCredentialsModalContent";
import { UpdateForgedOAuthCredentialsModalContent } from "@/features/forge/components/credentials/UpdateForgedOAuthCredentialsModalContent";
import { Modal, ModalOverlay } from "@chakra-ui/react";
import type { Credentials } from "@typebot.io/credentials/schemas";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";

export const CredentialsUpdateModal = ({
  editingCredentials,
  scope,
  onSubmit,
  onClose,
}: {
  editingCredentials?: {
    id: string;
    type: Credentials["type"];
  };
  scope: "workspace" | "user";
  onClose: () => void;
  onSubmit: () => void;
}) => {
  return (
    <Modal isOpen={editingCredentials !== undefined} onClose={onClose}>
      <ModalOverlay />
      {editingCredentials && (
        <CredentialsUpdateModalContent
          editingCredentials={editingCredentials}
          onSubmit={onSubmit}
          scope={scope}
        />
      )}
    </Modal>
  );
};

const CredentialsUpdateModalContent = ({
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
      <SmtpUpdateModalContent
        credentialsId={editingCredentials.id}
        onUpdate={onSubmit}
      />
    );

  if (editingCredentials.type === "stripe")
    return (
      <UpdateStripeCredentialsModalContent
        credentialsId={editingCredentials.id}
        onUpdate={onSubmit}
      />
    );

  if (editingCredentials.type === "whatsApp") return null;

  if (forgedBlocks[editingCredentials.type].auth?.type === "oauth")
    return (
      <UpdateForgedOAuthCredentialsModalContent
        credentialsId={editingCredentials.id}
        blockDef={forgedBlocks[editingCredentials.type]}
        onUpdate={onSubmit}
        scope={scope}
      />
    );

  return (
    <UpdateForgedCredentialsModalContent
      credentialsId={editingCredentials.id}
      blockDef={forgedBlocks[editingCredentials.type]}
      onUpdate={onSubmit}
      scope={scope}
    />
  );
};
