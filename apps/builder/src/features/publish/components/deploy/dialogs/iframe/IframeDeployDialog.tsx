import { Text } from "@chakra-ui/react";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { useState } from "react";
import { AlertInfo } from "@/components/AlertInfo";
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
          <AlertInfo>You need to publish your bot first.</AlertInfo>
        )}
        <StandardSettings
          onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
        />
        <Text>Paste this anywhere in your HTML code:</Text>

        <IframeSnippet
          widthLabel={inputValues.widthLabel ?? "100%"}
          heightLabel={inputValues.heightLabel}
        />
      </Dialog.Popup>
    </Dialog.Root>
  );
};
