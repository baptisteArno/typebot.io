import { isDefined } from "@udecode/plate-common";
import React, { useState } from "react";
import type { ModalProps } from "../../EmbedButton";
import { EmbedModal } from "../../EmbedModal";
import { ScriptInstructions } from "./instructions/ScriptInstructions";

export const ScriptModal = ({ isOpen, onClose, isPublished }: ModalProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    "standard" | "popup" | "bubble" | undefined
  >();
  return (
    <EmbedModal
      titlePrefix="Script"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <ScriptInstructions type={selectedEmbedType} />
      )}
    </EmbedModal>
  );
};
