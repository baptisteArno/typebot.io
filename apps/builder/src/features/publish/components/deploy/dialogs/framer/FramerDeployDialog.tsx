import { isDefined } from "@udecode/plate-common";
import React, { useState } from "react";
import type { DialogProps } from "../../DeployButton";
import { DeployDialog } from "../../DeployDialog";
import { FramerInstructions } from "./instructions/FramerInstructions";

export const FramerDeployDialog = ({
  isOpen,
  onClose,
  isPublished,
}: DialogProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    "standard" | "popup" | "bubble" | undefined
  >();

  return (
    <DeployDialog
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
    </DeployDialog>
  );
};
