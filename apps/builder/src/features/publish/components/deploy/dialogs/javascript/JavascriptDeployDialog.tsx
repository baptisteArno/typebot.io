import { isDefined } from "@typebot.io/lib/utils";
import { useState } from "react";
import type { DialogProps } from "../../DeployButton";
import { DeployDialog } from "../../DeployDialog";
import { JavascriptInstructions } from "./instructions/JavascriptInstructions";

export const JavascriptDeployDialog = ({
  isOpen,
  onClose,
  isPublished,
}: DialogProps) => {
  const [selectedEmbedType, setSelectedEmbedType] = useState<
    "standard" | "popup" | "bubble" | undefined
  >();
  return (
    <DeployDialog
      titlePrefix="Javascript"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <JavascriptInstructions type={selectedEmbedType} />
      )}
    </DeployDialog>
  );
};
