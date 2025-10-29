import { cn } from "@typebot.io/ui/lib/cn";
import { CodeEditor } from "@/components/inputs/CodeEditor";
import { TextLink } from "@/components/TextLink";
import { useEditor } from "@/features/editor/providers/EditorProvider";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { parseApiHost } from "@/features/publish/components/deploy/snippetParsers/shared";

export const ApiPreviewInstructions = ({
  className,
}: {
  className?: string;
}) => {
  const { typebot } = useTypebot();
  const { startPreviewFrom } = useEditor();

  const startParamsBody =
    startPreviewFrom?.type === "group"
      ? `{
  "startGroupId": "${startPreviewFrom.id}"
}`
      : startPreviewFrom?.type === "event"
        ? `{
  "startEventId": "${startPreviewFrom.id}"
}`
        : undefined;

  const replyBody = `{
  "message": "This is my reply"
}`;

  return (
    <div
      className={cn("flex flex-col gap-10 overflow-y-auto w-full", className)}
    >
      <ol className="flex flex-col gap-6 px-1">
        <li>
          All your requests need to be authenticated with an API token.{" "}
          <TextLink href="https://docs.typebot.io/api-reference/authentication">
            See instructions
          </TextLink>
          .
        </li>
        <li>
          <div className="flex flex-col gap-2">
            <p>
              To start the chat, send a <code>POST</code> request to
            </p>
            <CodeEditor
              isReadOnly
              lang={"shell"}
              value={`${parseApiHost(typebot?.customDomain)}/api/v1/typebots/${
                typebot?.id
              }/preview/startChat`}
            />
            {startPreviewFrom && (
              <>
                <p>with the following JSON body:</p>
                <CodeEditor isReadOnly lang={"json"} value={startParamsBody} />
              </>
            )}
          </div>
        </li>
        <li>
          The first response will contain a <code>sessionId</code> that you will
          need for subsequent requests.
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
      <p className="text-sm pl-1">
        Check out the{" "}
        <TextLink
          href="https://docs.typebot.io/api-reference/chat/start-preview-chat"
          isExternal
        >
          API reference
        </TextLink>{" "}
        for more information
      </p>
    </div>
  );
};
