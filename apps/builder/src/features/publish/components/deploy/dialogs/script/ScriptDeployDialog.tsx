import { isDefined } from "@udecode/plate-common";
import React, { useState } from "react";
import type { DialogProps } from "../../DeployButton";
import { DeployDialog } from "../../DeployDialog";
import { ScriptInstructions } from "./instructions/ScriptInstructions";

export const ScriptDeployDialog = ({
  isOpen,
  onClose,
  isPublished,
}: DialogProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    "standard" | "popup" | "bubble" | undefined
  >();
  return (
    <DeployDialog
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
    </DeployDialog>
  );
};
