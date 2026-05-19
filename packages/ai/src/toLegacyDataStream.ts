import type { TextStreamPart, ToolSet } from "ai";

type Props<Tools extends ToolSet> = {
  stream: AsyncIterable<TextStreamPart<Tools>>;
  getErrorMessage: (error: unknown) => string;
};

export const toLegacyDataStream = <Tools extends ToolSet>({
  stream,
  getErrorMessage,
}: Props<Tools>) =>
  new ReadableStream<Uint8Array>({
    async start(controller) {
      const textEncoder = new TextEncoder();
      let stepIndex = 0;

      const enqueuePart = (type: LegacyDataStreamPartType, value: unknown) =>
        controller.enqueue(
          textEncoder.encode(formatLegacyDataStreamPart(type, value)),
        );

      try {
        for await (const chunk of stream) {
          switch (chunk.type) {
            case "text-delta": {
              enqueuePart("text", chunk.text);
              break;
            }
            case "tool-input-start": {
              enqueuePart("tool_call_streaming_start", {
                toolCallId: chunk.id,
                toolName: chunk.toolName,
              });
              break;
            }
            case "tool-input-delta": {
              enqueuePart("tool_call_delta", {
                toolCallId: chunk.id,
                argsTextDelta: chunk.delta,
              });
              break;
            }
            case "tool-call": {
              enqueuePart("tool_call", {
                toolCallId: chunk.toolCallId,
                toolName: chunk.toolName,
                args: chunk.input,
              });
              break;
            }
            case "tool-result": {
              enqueuePart("tool_result", {
                toolCallId: chunk.toolCallId,
                result: chunk.output,
              });
              break;
            }
            case "tool-error": {
              enqueuePart("error", getErrorMessage(chunk.error));
              break;
            }
            case "file": {
              enqueuePart("file", {
                data: chunk.file.base64,
                mimeType: chunk.file.mediaType,
              });
              break;
            }
            case "start-step": {
              stepIndex += 1;
              enqueuePart("start_step", { messageId: `step-${stepIndex}` });
              break;
            }
            case "finish-step": {
              enqueuePart("finish_step", {
                finishReason: chunk.finishReason,
                isContinued: false,
              });
              break;
            }
            case "finish": {
              enqueuePart("finish_message", {
                finishReason: chunk.finishReason,
              });
              break;
            }
            case "error": {
              enqueuePart("error", getErrorMessage(chunk.error));
              break;
            }
          }
        }
      } catch (error) {
        enqueuePart("error", getErrorMessage(error));
      } finally {
        controller.close();
      }
    },
  });

type LegacyDataStreamPartType =
  | "text"
  | "error"
  | "tool_call"
  | "tool_result"
  | "tool_call_streaming_start"
  | "tool_call_delta"
  | "finish_message"
  | "finish_step"
  | "start_step"
  | "file";

const legacyDataStreamPrefixes = {
  text: "0",
  error: "3",
  tool_call: "9",
  tool_result: "a",
  tool_call_streaming_start: "b",
  tool_call_delta: "c",
  finish_message: "d",
  finish_step: "e",
  start_step: "f",
  file: "k",
} satisfies Record<LegacyDataStreamPartType, string>;

const formatLegacyDataStreamPart = (
  type: LegacyDataStreamPartType,
  value: unknown,
) => `${legacyDataStreamPrefixes[type]}:${JSON.stringify(value) ?? "null"}\n`;
