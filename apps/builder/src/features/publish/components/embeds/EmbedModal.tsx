import { AlertInfo } from "@/components/AlertInfo";
import { ChevronLeftIcon } from "@/components/icons";
import {
  HStack,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";
import { capitalize } from "@typebot.io/lib/utils";
import { EmbedTypeMenu } from "./EmbedTypeMenu/EmbedTypeMenu";

type Props = {
  selectedEmbedType: "standard" | "popup" | "bubble" | undefined;
  titlePrefix: string;
  isOpen: boolean;
  isPublished: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onSelectEmbedType: (
    type: "standard" | "popup" | "bubble" | undefined,
  ) => void;
};

export const EmbedModal = ({
  selectedEmbedType,
  isOpen,
  isPublished,
  titlePrefix,
  children,
  onSelectEmbedType,
  onClose,
}: Props) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    size={!selectedEmbedType ? "2xl" : "xl"}
  >
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>
        <HStack>
          {selectedEmbedType && (
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label="back"
              variant="ghost"
              colorScheme="gray"
              mr={2}
              onClick={() => onSelectEmbedType(undefined)}
            />
          )}
          <Heading size="md">
            {titlePrefix}{" "}
            {selectedEmbedType && `- ${capitalize(selectedEmbedType)}`}
          </Heading>
        </HStack>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody as={Stack} spacing={4} pt={0}>
        {!isPublished && (
          <AlertInfo>You need to publish your bot first.</AlertInfo>
        )}
        {!selectedEmbedType ? (
          <EmbedTypeMenu onSelectEmbedType={onSelectEmbedType} />
        ) : (
          children
        )}
      </ModalBody>
      <ModalFooter />
    </ModalContent>
  </Modal>
);
