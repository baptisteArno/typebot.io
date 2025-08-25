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

export const BlinkDeployDialog = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: DialogProps): JSX.Element => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>Blink</Dialog.Title>
        <Dialog.CloseButton />
        {!isPublished && (
          <AlertInfo mb="4">You need to publish your bot first.</AlertInfo>
        )}
        <OrderedList spacing={4}>
          <ListItem>
            In the Blink Admin window, head over to{" "}
            <Code>Content Studio &gt; Hub</Code>
          </ListItem>
          <ListItem>
            Click on the <Code>Add Content &gt; Form</Code> button
          </ListItem>
          <ListItem>
            For the form provider, select <Code>Other</Code>
          </ListItem>
          <ListItem>
            <Stack>
              <Text>
                Paste your bot URL and customize the look and feel of this new
                form
              </Text>
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
          <ListItem>
            <Text>
              You can optionally add <Code>Custom Variables</Code> to prefill
              your bot variables with the respondent's Blink data.
            </Text>
          </ListItem>
        </OrderedList>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
