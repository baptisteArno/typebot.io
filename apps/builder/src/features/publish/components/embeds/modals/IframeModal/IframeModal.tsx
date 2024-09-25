import { AlertInfo } from "@/components/AlertInfo";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import type { ModalProps } from "../../EmbedButton";
import { StandardSettings } from "../../settings/StandardSettings";
import { IframeSnippet } from "./IframeSnippet";

export const IframeModal = ({ isPublished, isOpen, onClose }: ModalProps) => {
  const [inputValues, setInputValues] = useState<{
    heightLabel: string;
    widthLabel?: string;
  }>({
    heightLabel: "100%",
    widthLabel: "100%",
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Iframe</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing={4} pt="0">
          {!isPublished && (
            <AlertInfo>You need to publish your bot first.</AlertInfo>
          )}
          <StandardSettings
            onUpdateWindowSettings={(settings) =>
              setInputValues({ ...settings })
            }
          />
          <Text>Paste this anywhere in your HTML code:</Text>

          <IframeSnippet
            widthLabel={inputValues.widthLabel ?? "100%"}
            heightLabel={inputValues.heightLabel}
          />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
};
