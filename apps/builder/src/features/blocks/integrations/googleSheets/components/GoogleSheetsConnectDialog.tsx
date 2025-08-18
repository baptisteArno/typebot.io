import { AlertInfo } from "@/components/AlertInfo";
import { GoogleLogo } from "@/components/GoogleLogo";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { Button, Image, Text } from "@chakra-ui/react";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import Link from "next/link";
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
          <Button
            as={Link}
            leftIcon={<GoogleLogo />}
            data-testid="google"
            isLoading={["loading", "authenticated"].includes(status)}
            variant="outline"
            href={getGoogleSheetsConsentScreenUrlQuery(
              window.location.href,
              workspace.id,
              blockId,
              typebotId,
            )}
          >
            Continue with Google
          </Button>
        )}
      </Dialog.Footer>
    </Dialog.Popup>
  );
};
