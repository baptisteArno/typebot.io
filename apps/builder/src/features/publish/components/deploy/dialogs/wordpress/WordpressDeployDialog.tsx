import { isDefined } from "@typebot.io/lib/utils";
import { useState } from "react";
import type { DialogProps } from "../../DeployButton";
import { DeployDialog } from "../../DeployDialog";
import { WordpressInstructions } from "./instructions/WordpressInstructions";

export const WordpressDeployDialog = ({
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
      titlePrefix="Wordpress"
      isOpen={isOpen}
      onClose={onClose}
      isPublished={isPublished}
      onSelectEmbedType={setSelectedEmbedType}
      selectedEmbedType={selectedEmbedType}
    >
      {isDefined(selectedEmbedType) && (
        <WordpressInstructions type={selectedEmbedType} publicId={publicId} />
      )}
    </DeployDialog>
  );
};
