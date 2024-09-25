import { isDefined } from "@udecode/plate-common";
import React, { useState } from "react";
import type { ModalProps } from "../../EmbedButton";
import { EmbedModal } from "../../EmbedModal";
import { FramerInstructions } from "./instructions/FramerInstructions";

export const FramerModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    "standard" | "popup" | "bubble" | undefined
  >();

  return (
    <EmbedModal
      titlePrefix="Framer"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <FramerInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  );
};
