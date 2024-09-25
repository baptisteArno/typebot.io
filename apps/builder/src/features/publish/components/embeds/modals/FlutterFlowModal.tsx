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

export const FlutterFlowModal = ({
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
          <Heading size="md">FlutterFlow</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isPublished && (
            <AlertInfo mb="4">You need to publish your bot first.</AlertInfo>
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
          </OrderedList>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};
