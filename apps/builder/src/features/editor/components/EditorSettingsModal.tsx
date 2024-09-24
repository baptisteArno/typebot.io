import { UserPreferencesForm } from "@/features/account/components/UserPreferencesForm";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const EditorSettingsModal = ({ isOpen, onClose }: Props) => (
  <Modal isOpen={isOpen} onClose={onClose} size="xl">
    <ModalOverlay />
    <ModalContent>
      <ModalCloseButton />
      <ModalBody pt="12" pb="8" px="8">
        <UserPreferencesForm />
      </ModalBody>
    </ModalContent>
  </Modal>
);
