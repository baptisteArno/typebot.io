// Copied from https://github.com/vercel/ai/blob/f9db8fd6543202a8404a7a1a40f938d6270b08ef/packages/core/streams/assistant-response.ts
// Because the stream is not exported from the package
import { type AssistantMessage, type DataMessage, formatStreamPart } from "ai";
import type { AssistantStream as AssistantStreamType } from "openai/lib/AssistantStream";
import type { Run } from "openai/resources/beta/threads/runs/runs";

/**
You can pass the thread and the latest message into the `AssistantResponse`. This establishes the context for the response.
 */
type AssistantResponseSettings = {
  /**
The thread ID that the response is associated with.
   */
  threadId: string;

  /**
The ID of the latest message that the response is associated with.
 */
  messageId: string;
};

/**
The process parameter is a callback in which you can run the assistant on threads, and send messages and data messages to the client.
 */
type AssistantResponseCallback = (options: {
  /**
@deprecated use variable from outer scope instead.
   */
  threadId: string;

  /**
@deprecated use variable from outer scope instead.
   */
  messageId: string;

  /**
Forwards an assistant message (non-streaming) to the client.
   */
  sendMessage: (message: AssistantMessage) => void;

  /**
Send a data message to the client. You can use this to provide information for rendering custom UIs while the assistant is processing the thread.
 */
  sendDataMessage: (message: DataMessage) => void;

  /**
Forwards the assistant response stream to the client. Returns the `Run` object after it completes, or when it requires an action.
   */
  forwardStream: (stream: AssistantStreamType) => Promise<Run | undefined>;
}) => Promise<void>;

/**
The `AssistantResponse` allows you to send a stream of assistant update to `useAssistant`.
It is designed to facilitate streaming assistant responses to the `useAssistant` hook.
It receives an assistant thread and a current message, and can send messages and data messages to the client.
 */
export function AssistantStream(
  { threadId, messageId }: AssistantResponseSettings,
  process: AssistantResponseCallback,
) {
  return new ReadableStream({
    async start(controller) {
      const textEncoder = new TextEncoder();

      const sendMessage = (message: AssistantMessage) => {
        controller.enqueue(
          textEncoder.encode(formatStreamPart("assistant_message", message)),
        );
      };

      const sendDataMessage = (message: DataMessage) => {
        controller.enqueue(
          textEncoder.encode(formatStreamPart("data_message", message)),
        );
      };

      const sendError = (errorMessage: string) => {
        controller.enqueue(
          textEncoder.encode(formatStreamPart("error", errorMessage)),
        );
      };

      const forwardStream = async (stream: AssistantStreamType) => {
        let result: Run | undefined = undefined;

        for await (const value of stream) {
          switch (value.event) {
            case "thread.message.created": {
              controller.enqueue(
                textEncoder.encode(
                  formatStreamPart("assistant_message", {
                    id: value.data.id,
                    role: "assistant",
                    content: [{ type: "text", text: { value: "" } }],
                  }),
                ),
              );
              break;
            }

            case "thread.message.delta": {
              const content = value.data.delta.content?.[0];

              if (content?.type === "text" && content.text?.value != null) {
                controller.enqueue(
                  textEncoder.encode(
                    formatStreamPart("text", content.text.value),
                  ),
                );
              }

              break;
            }

            case "thread.run.completed":
            case "thread.run.requires_action": {
              result = value.data;
              break;
            }
          }
        }

        return result;
      };

      // send the threadId and messageId as the first message:
      controller.enqueue(
        textEncoder.encode(
          formatStreamPart("assistant_control_data", {
            threadId,
            messageId,
          }),
        ),
      );

      try {
        await process({
          threadId,
          messageId,
          sendMessage,
          sendDataMessage,
          forwardStream,
        });
      } catch (error) {
        sendError((error as any).message ?? `${error}`);
      } finally {
        controller.close();
      }
    },
    pull(controller) {},
    cancel() {},
  });
}
