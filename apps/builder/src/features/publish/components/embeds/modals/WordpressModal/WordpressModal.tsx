import { isDefined } from "@typebot.io/lib/utils";
import { useState } from "react";
import type { ModalProps } from "../../EmbedButton";
import { EmbedModal } from "../../EmbedModal";
import { WordpressInstructions } from "./instructions/WordpressInstructions";

export const WordpressModal = ({
  isOpen,
  onClose,
  isPublished,
  publicId,
}: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    "standard" | "popup" | "bubble" | undefined
  >();
  return (
    <EmbedModal
      titlePrefix="Wordpress"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <WordpressInstructions type={selectedEmbedType} publicId={publicId} />
      )}
    </EmbedModal>
  );
};
