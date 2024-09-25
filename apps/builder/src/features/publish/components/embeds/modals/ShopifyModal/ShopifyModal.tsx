import { isDefined } from "@udecode/plate-common";
import React, { useState } from "react";
import type { ModalProps } from "../../EmbedButton";
import { EmbedModal } from "../../EmbedModal";
import { ShopifyInstructions } from "./instructions/ShopifyInstructions";

export const ShopifyModal = ({
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
      titlePrefix="Shopify"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <ShopifyInstructions type={selectedEmbedType} publicId={publicId} />
      )}
    </EmbedModal>
  );
};
