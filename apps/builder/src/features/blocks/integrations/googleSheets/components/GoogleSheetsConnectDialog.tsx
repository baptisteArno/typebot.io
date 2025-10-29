import { Dialog } from "@typebot.io/ui/components/Dialog";
import { ButtonLink } from "@/components/ButtonLink";
import { GoogleLogo } from "@/components/GoogleLogo";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { getGoogleSheetsConsentScreenUrlQuery } from "../queries/getGoogleSheetsConsentScreenUrlQuery";

type Props = {
  isOpen: boolean;
  typebotId?: string;
  blockId?: string;
  onClose: () => void;
};

export const GoogleSheetConnectDialog = ({
  typebotId,
  blockId,
  isOpen,
  onClose,
}: Props) => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <GoogleSheetConnectDialogBody typebotId={typebotId} blockId={blockId} />
    </Dialog.Root>
  );
};

export const GoogleSheetConnectDialogBody = ({
  typebotId,
  blockId,
}: {
  typebotId?: string;
  blockId?: string;
}) => {
  const { workspace } = useWorkspace();

  return (
    <Dialog.Popup>
      <Dialog.Title>Connect Spreadsheets</Dialog.Title>
      <p>
        Make sure to check all the permissions so that the integration works as
        expected:
      </p>
      <img
        className="rounded-md"
        src="/images/google-spreadsheets-scopes.png"
        alt="Google Spreadsheets checkboxes"
      />
      <Dialog.Footer>
        {workspace?.id && (
          <ButtonLink
            data-testid="google"
            disabled={["loading", "authenticated"].includes(status)}
            variant="outline-secondary"
            href={getGoogleSheetsConsentScreenUrlQuery(
              window.location.href,
              workspace.id,
              blockId,
              typebotId,
            )}
            className="mx-auto"
          >
            <GoogleLogo />
            Continue with Google
          </ButtonLink>
        )}
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
