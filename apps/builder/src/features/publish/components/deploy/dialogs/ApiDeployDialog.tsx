import { Alert } from "@typebot.io/ui/components/Alert";
import { Dialog } from "@typebot.io/ui/components/Dialog";
import { InformationSquareIcon } from "@typebot.io/ui/icons/InformationSquareIcon";
import type { JSX } from "react";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { TextLink } from "@/components/TextLink";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import type { DialogProps } from "../DeployButton";
import { parseApiHost } from "../snippetParsers/shared";

export const ApiDeployDialog = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: DialogProps): JSX.Element => {
  const { typebot } = useTypebot();

  const replyBody = `{
  "message": "This is my reply"
}`;

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog.Popup className="max-w-xl">
        <Dialog.Title>API</Dialog.Title>
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
            <div className="flex flex-col gap-2">
              <p>
                To start the chat, send a <code>POST</code> request to
              </p>
              <CodeEditor
                isReadOnly
                lang={"shell"}
                value={`${parseApiHost(
                  typebot?.customDomain,
                )}/api/v1/typebots/${publicId}/startChat`}
              />
            </div>
          </li>
          <li>
            The first response will contain a <code>sessionId</code> that you
            will need for subsequent requests.
          </li>
          <li>
            <div className="flex flex-col gap-2">
              <p>
                To send replies, send <code>POST</code> requests to
              </p>
              <CodeEditor
                isReadOnly
                lang={"shell"}
                value={`${parseApiHost(
                  typebot?.customDomain,
                )}/api/v1/sessions/<ID_FROM_FIRST_RESPONSE>/continueChat`}
              />
              <p>With the following JSON body:</p>
              <CodeEditor isReadOnly lang={"json"} value={replyBody} />
              <p>
                Replace <code>{"<ID_FROM_FIRST_RESPONSE>"}</code> with{" "}
                <code>sessionId</code>.
              </p>
            </div>
          </li>
        </ol>
        <p className="text-sm">
          Check out the{" "}
          <TextLink
            href="https://docs.typebot.io/api-reference/chat/start-chat"
            isExternal
          >
            API reference
          </TextLink>{" "}
          for more information
        </p>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
