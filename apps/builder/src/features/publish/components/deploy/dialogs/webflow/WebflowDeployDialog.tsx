import { isDefined } from "@udecode/plate-common";
import React, { useState } from "react";
import type { DialogProps } from "../../DeployButton";
import { DeployDialog } from "../../DeployDialog";
import { WebflowInstructions } from "./instructions/WebflowInstructions";

export const WebflowDeployDialog = ({
  isOpen,
  onClose,
  isPublished,
}: DialogProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    "standard" | "popup" | "bubble" | undefined
  >();

  return (
    <DeployDialog
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
    </DeployDialog>
  );
};
