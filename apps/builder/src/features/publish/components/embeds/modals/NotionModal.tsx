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

export const NotionModal = ({
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
          <Heading size="md">Notion</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isPublished && (
            <AlertInfo mb="4">You need to publish your bot first.</AlertInfo>
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
