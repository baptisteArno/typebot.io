import { env } from "@typebot.io/env";
import { Alert } from "@typebot.io/ui/components/Alert";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import type { JSX } from "react";
import { CopyInput } from "@/components/inputs/CopyInput";
import type { DialogProps } from "../DeployButton";

export const BlinkDeployDialog = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: DialogProps): JSX.Element => {
  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>Blink</Dialog.Title>
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
            In the Blink Admin window, head over to{" "}
            <code>Content Studio &gt; Hub</code>
          </li>
          <li>
            Click on the <code>Add Content &gt; Form</code> button
          </li>
          <li>
            For the form provider, select <code>Other</code>
          </li>
          <li>
            <div className="flex flex-col gap-2">
              <p>
                Paste your bot URL and customize the look and feel of this new
                form
              </p>
              <CopyInput
                value={`${env.NEXT_PUBLIC_VIEWER_URL[0]}/${publicId}`}
              />
            </div>
          </li>
          <li>
            <p>
              You can optionally add <code>Custom Variables</code> to prefill
              your bot variables with the respondent's Blink data.
            </p>
          </li>
        </ol>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
