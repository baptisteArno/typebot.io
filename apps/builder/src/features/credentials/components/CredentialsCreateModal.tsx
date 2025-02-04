import { StripeCreateModalContent } from "@/features/blocks/inputs/payment/components/StripeConfigModal";
import { GoogleSheetConnectModalContent } from "@/features/blocks/integrations/googleSheets/components/GoogleSheetsConnectModal";
import { SmtpCreateModalContent } from "@/features/blocks/integrations/sendEmail/components/SmtpConfigModal";
import { CreateForgedCredentialsModalContent } from "@/features/forge/components/credentials/CreateForgedCredentialsModal";
import { WhatsAppCreateModalContent } from "@/features/publish/components/embeds/modals/WhatsAppModal/WhatsAppCredentialsModal";
import { Modal, ModalOverlay } from "@chakra-ui/react";
import type { Credentials } from "@typebot.io/credentials/schemas";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";

export const CredentialsCreateModal = ({
  creatingType,
  scope,
  onSubmit,
  onClose,
}: {
  creatingType?: Credentials["type"];
  scope: "workspace" | "user";
  onClose: () => void;
  onSubmit: () => void;
}) => {
  return (
    <Modal
      isOpen={creatingType !== undefined}
      onClose={onClose}
      size={parseModalSize(creatingType)}
    >
      <ModalOverlay />
      {creatingType && (
        <CredentialsCreateModalContent
          type={creatingType}
          scope={scope}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};

const CredentialsCreateModalContent = ({
  type,
  scope,
  onSubmit,
  onClose,
}: {
  type: Credentials["type"];
  scope: "workspace" | "user";
  onClose: () => void;
  onSubmit: () => void;
}) => {
  switch (type) {
    case "google sheets":
      return <GoogleSheetConnectModalContent />;
    case "smtp":
      return <SmtpCreateModalContent onNewCredentials={onSubmit} />;
    case "stripe":
      return (
        <StripeCreateModalContent
          onNewCredentials={onSubmit}
          onClose={onClose}
        />
      );
    case "whatsApp":
      return (
        <WhatsAppCreateModalContent
          onNewCredentials={onSubmit}
          onClose={onClose}
        />
      );
    default:
      return (
        <CreateForgedCredentialsModalContent
          blockDef={forgedBlocks[type]}
          onNewCredentials={onSubmit}
          scope={scope}
        />
      );
  }
};

const parseModalSize = (type?: Credentials["type"]) => {
  switch (type) {
    case "whatsApp":
      return "3xl";
    default:
      return "lg";
  }
};
