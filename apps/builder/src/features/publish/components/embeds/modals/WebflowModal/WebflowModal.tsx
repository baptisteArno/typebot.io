import { isDefined } from "@udecode/plate-common";
import React, { useState } from "react";
import type { ModalProps } from "../../EmbedButton";
import { EmbedModal } from "../../EmbedModal";
import { WebflowInstructions } from "./instructions/WebflowInstructions";

export const WebflowModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    "standard" | "popup" | "bubble" | undefined
  >();

  return (
    <EmbedModal
      titlePrefix="Webflow"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <WebflowInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  );
};
