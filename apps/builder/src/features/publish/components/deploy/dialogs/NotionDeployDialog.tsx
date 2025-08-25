import { AlertInfo } from "@/components/AlertInfo";
import { CopyButton } from "@/components/CopyButton";
import {
  Code,
  Input,
  InputGroup,
  InputRightElement,
  ListItem,
  OrderedList,
  Stack,
  Text,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import type { DialogProps } from "../DeployButton";

export const NotionDeployDialog = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: DialogProps): JSX.Element => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>Notion</Dialog.Title>
        <Dialog.CloseButton />
        {!isPublished && (
          <AlertInfo>You need to publish your bot first.</AlertInfo>
        )}
        <OrderedList spacing={4}>
          <ListItem>
            Type <Code>/embed</Code>
          </ListItem>
          <ListItem>
            <Stack>
              <Text>Paste your typebot URL</Text>
              <InputGroup size="sm">
                <Input
                  type={"text"}
                  defaultValue={`${env.NEXT_PUBLIC_VIEWER_URL[0]}/${publicId}`}
                />
                <InputRightElement width="60px">
                  <CopyButton
                    textToCopy={`${env.NEXT_PUBLIC_VIEWER_URL[0]}/${publicId}`}
                  />
                </InputRightElement>
              </InputGroup>
            </Stack>
          </ListItem>
        </OrderedList>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
