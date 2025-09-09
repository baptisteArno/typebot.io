import type { Credentials } from "@typebot.io/credentials/schemas";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { CreateStripeCredentialsDialogBody } from "@/features/blocks/inputs/payment/components/CreateStripeCredentialsDialog";
import { GoogleSheetConnectDialogBody } from "@/features/blocks/integrations/googleSheets/components/GoogleSheetsConnectDialog";
import { SmtpCredentialsCreateDialogBody } from "@/features/blocks/integrations/sendEmail/components/SmtpCredentialsCreateDialog";
import { useFeatureFlagsQuery } from "@/features/featureFlags/useFeatureFlagsQuery";
import { ForgedCredentialsCreateDialogBody } from "@/features/forge/components/credentials/ForgedCredentialsCreateDialog";
import { ForgedOAuthCredentialsCreateDialogBody } from "@/features/forge/components/credentials/ForgedOAuthCredentialsCreateDialog";
import { WhatsAppCreateDialogBody } from "@/features/publish/components/deploy/dialogs/whatsApp/WhatsAppCredentialsDialog";

export const CredentialsCreateDialog = ({
  isOpen,
  type,
  scope,
  onSubmit,
  onClose,
}: {
  isOpen: boolean;
  type: Credentials["type"] | undefined;
  scope: "workspace" | "user";
  onClose: () => void;
  onSubmit: () => void;
}) => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      {type && (
        <CredentialsCreateDialogPopup
          type={type}
          scope={scope}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      )}
    </Dialog.Root>
  );
};

const CredentialsCreateDialogPopup = ({
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
  if (type === "google sheets") return <GoogleSheetConnectDialogBody />;
  if (type === "smtp")
    return <SmtpCredentialsCreateDialogBody onNewCredentials={onSubmit} />;
  if (type === "stripe")
    return (
      <CreateStripeCredentialsDialogBody
        onNewCredentials={onSubmit}
        onClose={onClose}
      />
    );
  if (type === "whatsApp")
    return (
      <WhatsAppCreateDialogBody
        is360DialogEnabled={featureFlags?.["360dialog"] ?? false}
        onNewCredentials={onSubmit}
        onClose={onClose}
      />
    );
  if (type === "http proxy") return null;

  if (forgedBlocks[type].auth?.type === "oauth")
    return (
      <ForgedOAuthCredentialsCreateDialogBody
        blockDef={forgedBlocks[type]}
        onNewCredentials={onSubmit}
        scope={scope}
      />
    );

  return (
    <ForgedCredentialsCreateDialogBody
      blockDef={forgedBlocks[type]}
      onNewCredentials={onSubmit}
      scope={scope}
    />
  );
};
