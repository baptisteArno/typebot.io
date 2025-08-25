import { AlertInfo } from "@/components/AlertInfo";
import { ButtonLink } from "@/components/ButtonLink";
import { GoogleLogo } from "@/components/GoogleLogo";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { Image, Text } from "@chakra-ui/react";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import React from "react";
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
      <Text>
        Make sure to check all the permissions so that the integration works as
        expected:
      </Text>
      <Image
        src="/images/google-spreadsheets-scopes.png"
        alt="Google Spreadsheets checkboxes"
        rounded="md"
      />
      <AlertInfo>
        Google does not provide more granular permissions than &quot;read&quot;
        or &quot;write&quot; access. That&apos;s why it states that Typebot can
        also delete your spreadsheets which it won&apos;t.
      </AlertInfo>
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
