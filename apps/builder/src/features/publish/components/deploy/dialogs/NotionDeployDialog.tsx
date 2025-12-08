import { env } from "@typebot.io/env";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import type { JSX } from "react";
import { CopyInput } from "@/components/inputs/CopyInput";
import type { DialogProps } from "../DeployButton";

export const NotionDeployDialog = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: DialogProps): JSX.Element => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>Notion</Dialog.Title>
        <Dialog.CloseButton />
        {!isPublished && (
          <Alert.Root>
            <InformationSquareIcon />
            <Alert.Description>
              You need to publish your bot first.
            </Alert.Description>
          </Alert.Root>
        )}
        <ol>
          <li>
            Type <code>/embed</code>
          </li>
          <li>
            <div className="flex flex-col gap-2">
              <p>Paste your typebot URL</p>
              <CopyInput
                value={`${env.NEXT_PUBLIC_VIEWER_URL[0]}/${publicId}`}
              />
            </div>
          </li>
        </ol>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
