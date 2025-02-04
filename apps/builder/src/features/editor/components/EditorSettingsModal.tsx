import { useParentModal } from "@/features/graph/providers/ParentModalProvider";
import { UserPreferencesForm } from "@/features/user/components/UserPreferencesForm";
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

export const EditorSettingsModal = ({ isOpen, onClose }: Props) => {
  const { ref } = useParentModal();
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent ref={ref}>
        <ModalCloseButton />
        <ModalBody pt="12" pb="8" px="8">
          <UserPreferencesForm />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
