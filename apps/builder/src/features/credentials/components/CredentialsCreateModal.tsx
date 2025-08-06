import { StripeCreateModalContent } from "@/features/blocks/inputs/payment/components/StripeConfigModal";
import { GoogleSheetConnectModalContent } from "@/features/blocks/integrations/googleSheets/components/GoogleSheetsConnectModal";
import { SmtpCreateModalContent } from "@/features/blocks/integrations/sendEmail/components/SmtpConfigModal";
import { useFeatureFlagsQuery } from "@/features/featureFlags/useFeatureFlagsQuery";
import { CreateForgedCredentialsModalContent } from "@/features/forge/components/credentials/CreateForgedCredentialsModal";
import { CreateForgedOAuthCredentialsModalContent } from "@/features/forge/components/credentials/CreateForgedOAuthCredentialsModal";
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
  const featureFlags = useFeatureFlagsQuery();
  if (type === "google sheets") return <GoogleSheetConnectModalContent />;
  if (type === "smtp")
    return <SmtpCreateModalContent onNewCredentials={onSubmit} />;
  if (type === "stripe")
    return (
      <StripeCreateModalContent onNewCredentials={onSubmit} onClose={onClose} />
    );
  if (type === "whatsApp")
    return (
      <WhatsAppCreateModalContent
        is360DialogEnabled={featureFlags?.["360dialog"] ?? false}
        onNewCredentials={onSubmit}
        onClose={onClose}
      />
    );

  if (forgedBlocks[type].auth?.type === "oauth")
    return (
      <CreateForgedOAuthCredentialsModalContent
        blockDef={forgedBlocks[type]}
        onNewCredentials={onSubmit}
        scope={scope}
      />
    );

  return (
    <CreateForgedCredentialsModalContent
      blockDef={forgedBlocks[type]}
      onNewCredentials={onSubmit}
      scope={scope}
    />
  );
};

const parseModalSize = (type?: Credentials["type"]) => {
  switch (type) {
    case "whatsApp":
      return "3xl";
    default:
      return "lg";
  }
};
