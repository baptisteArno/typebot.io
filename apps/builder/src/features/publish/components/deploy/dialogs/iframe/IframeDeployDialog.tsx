import { Alert } from "@typebot.io/ui/components/Alert";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import { useState } from "react";
import type { DialogProps } from "../../DeployButton";
import { StandardSettings } from "../../settings/StandardSettings";
import { IframeSnippet } from "./IframeSnippet";

export const IframeDeployDialog = ({
  isPublished,
  isOpen,
  onClose,
}: DialogProps) => {
  const [inputValues, setInputValues] = useState<{
    heightLabel: string;
    widthLabel?: string;
  }>({
    heightLabel: "100%",
    widthLabel: "100%",
  });

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>Iframe</Dialog.Title>
        <Dialog.CloseButton />
        {!isPublished && (
          <Alert.Root>
            <InformationSquareIcon />
            <Alert.Description>
              You need to publish your bot first.
            </Alert.Description>
          </Alert.Root>
        )}
        <StandardSettings
          onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
        />
        <p>Paste this anywhere in your HTML code:</p>

        <IframeSnippet
          widthLabel={inputValues.widthLabel ?? "100%"}
          heightLabel={inputValues.heightLabel}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
};
