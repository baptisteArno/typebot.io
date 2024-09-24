import { TextLink } from "@/components/TextLink";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { useEditor } from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { parseApiHost } from "@/features/publish/components/embeds/snippetParsers";
import {
  Code,
  ListItem,
  OrderedList,
  Stack,
  type StackProps,
  Text,
} from "@chakra-ui/react";

export const ApiPreviewInstructions = (props: StackProps) => {
  const { typebot } = useTypebot();
  const { startPreviewAtGroup } = useEditor();

  const startParamsBody = startPreviewAtGroup
    ? `{
    "startGroupId": "${startPreviewAtGroup}"
}`
    : undefined;

  const replyBody = `{
  "message": "This is my reply"
}`;

  return (
    <Stack spacing={10} overflowY="auto" w="full" {...props}>
      <OrderedList spacing={6} px="1">
        <ListItem>
          All your requests need to be authenticated with an API token.{" "}
          <TextLink href="https://docs.typebot.io/api-reference/authentication">
            See instructions
          </TextLink>
          .
        </ListItem>
        <ListItem>
          <Stack>
            <Text>
              To start the chat, send a <Code>POST</Code> request to
            </Text>
            <CodeEditor
              isReadOnly
              lang={"shell"}
              value={`${parseApiHost(typebot?.customDomain)}/api/v1/typebots/${
                typebot?.id
              }/preview/startChat`}
            />
            {startPreviewAtGroup && (
              <>
                <Text>with the following JSON body:</Text>
                <CodeEditor isReadOnly lang={"json"} value={startParamsBody} />
              </>
            )}
          </Stack>
        </ListItem>
        <ListItem>
          The first response will contain a <Code>sessionId</Code> that you will
          need for subsequent requests.
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
      <Text fontSize="sm" pl="1">
        Check out the{" "}
        <TextLink
          href="https://docs.typebot.io/api-reference/chat/start-preview-chat"
          isExternal
        >
          API reference
        </TextLink>{" "}
        for more information
      </Text>
    </Stack>
  );
};
