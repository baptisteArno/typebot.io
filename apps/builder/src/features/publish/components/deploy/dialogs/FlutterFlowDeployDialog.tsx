import { Code, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { CopyInput } from "@/components/inputs/CopyInput";
import type { DialogProps } from "../DeployButton";

export const FlutterFlowDeployDialog = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: DialogProps): JSX.Element => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>FlutterFlow</Dialog.Title>
        <Dialog.CloseButton />
        {!isPublished && (
          <Alert.Root>
            <InformationSquareIcon />
            <Alert.Description>
              You need to publish your bot first.
            </Alert.Description>
          </Alert.Root>
        )}
        <OrderedList spacing={4}>
          <ListItem>
            Insert a <Code>WebView</Code> element
          </ListItem>
          <ListItem>
            <Stack>
              <Text>
                As the <Code>Webview URL</Code>, paste your typebot URL
              </Text>
              <CopyInput
                value={`${env.NEXT_PUBLIC_VIEWER_URL[0]}/${publicId}`}
              />
            </Stack>
          </ListItem>
        </OrderedList>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
