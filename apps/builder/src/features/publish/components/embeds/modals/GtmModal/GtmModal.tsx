import { isDefined } from "@udecode/plate-common";
import React, { useState } from "react";
import type { ModalProps } from "../../EmbedButton";
import { EmbedModal } from "../../EmbedModal";
import { GtmInstructions } from "./instructions/GtmInstructions";

export const GtmModal = ({
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
      titlePrefix="GTM"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <GtmInstructions type={selectedEmbedType} publicId={publicId} />
      )}
    </EmbedModal>
  );
};
