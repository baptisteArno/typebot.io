import { AlertInfo } from "@/components/AlertInfo";
import { CopyButton } from "@/components/CopyButton";
import {
  Code,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  OrderedList,
  Stack,
  Text,
} from "@chakra-ui/react";
import { env } from "@typebot.io/env";
import type { ModalProps } from "../EmbedButton";

export const BlinkModal = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: ModalProps): JSX.Element => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">Blink</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
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
                      size="sm"
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
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};
