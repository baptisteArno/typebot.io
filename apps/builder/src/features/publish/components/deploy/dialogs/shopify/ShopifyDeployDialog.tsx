import { isDefined } from "@typebot.io/lib/utils";
import { useState } from "react";
import type { DialogProps } from "../../DeployButton";
import { DeployDialog } from "../../DeployDialog";
import { ShopifyInstructions } from "./instructions/ShopifyInstructions";

export const ShopifyDeployDialog = ({
  isOpen,
  onClose,
  isPublished,
  publicId,
}: DialogProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    "standard" | "popup" | "bubble" | undefined
  >();
  return (
    <DeployDialog
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
    </DeployDialog>
  );
};
