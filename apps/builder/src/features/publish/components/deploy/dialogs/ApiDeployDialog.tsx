import { AlertInfo } from "@/components/AlertInfo";
import { TextLink } from "@/components/TextLink";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Code, ListItem, OrderedList, Stack, Text } from "@chakra-ui/react";
import { Dialog } from "@typebot.io/ui/components/Dialog";
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
          <AlertInfo>You need to publish your bot first.</AlertInfo>
        )}
        <OrderedList spacing={4} pl="4">
          <ListItem>
            <Stack>
              <Text>
                To start the chat, send a <Code>POST</Code> request to
              </Text>
              <CodeEditor
                isReadOnly
                lang={"shell"}
                value={`${parseApiHost(
                  typebot?.customDomain,
                )}/api/v1/typebots/${publicId}/startChat`}
              />
            </Stack>
          </ListItem>
          <ListItem>
            The first response will contain a <Code>sessionId</Code> that you
            will need for subsequent requests.
          </ListItem>
          <ListItem>
            <Stack>
              <Text>
                To send replies, send <Code>POST</Code> requests to
              </Text>
              <CodeEditor
                isReadOnly
                lang={"shell"}
                value={`${parseApiHost(
                  typebot?.customDomain,
                )}/api/v1/sessions/<ID_FROM_FIRST_RESPONSE>/continueChat`}
              />
              <Text>With the following JSON body:</Text>
              <CodeEditor isReadOnly lang={"json"} value={replyBody} />
              <Text>
                Replace <Code>{"<ID_FROM_FIRST_RESPONSE>"}</Code> with{" "}
                <Code>sessionId</Code>.
              </Text>
            </Stack>
          </ListItem>
        </OrderedList>
        <Text fontSize="sm" colorScheme="gray">
          Check out the{" "}
          <TextLink
            href="https://docs.typebot.io/api-reference/chat/start-chat"
            isExternal
          >
            API reference
          </TextLink>{" "}
          for more information
        </Text>
      </Dialog.Popup>
    </Dialog.Root>
  );
};
