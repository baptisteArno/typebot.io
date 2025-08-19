import { isDefined } from "@udecode/plate-common";
import React, { useState } from "react";
import type { DialogProps } from "../../DeployButton";
import { DeployDialog } from "../../DeployDialog";
import { GtmInstructions } from "./instructions/GtmInstructions";

export const GtmDeployDialog = ({
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
    </DeployDialog>
  );
};
