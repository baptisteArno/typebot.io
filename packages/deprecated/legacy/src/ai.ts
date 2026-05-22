type OpenAIChatCompletionChunk = {
  choices?: {
    delta?: {
      content?: string | null;
    };
  }[];
};

export const OpenAIStream = (
  response: AsyncIterable<OpenAIChatCompletionChunk>,
): ReadableStream<Uint8Array> =>
  new ReadableStream<Uint8Array>({
    async start(controller) {
      const textEncoder = new TextEncoder();

      try {
        for await (const chunk of response) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (!content) continue;
          controller.enqueue(
            textEncoder.encode(formatDataStreamPart("text", content)),
          );
        }
      } catch (error) {
        controller.enqueue(
          textEncoder.encode(
            formatDataStreamPart("error", getErrorMessage(error)),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

export class StreamingTextResponse extends Response {
  constructor(stream: BodyInit, init?: ResponseInit) {
    const headers = new Headers(init?.headers);
    if (!headers.has("Content-Type"))
      headers.set("Content-Type", "text/plain; charset=utf-8");

    super(stream, {
      ...init,
      status: init?.status ?? 200,
      headers,
    });
  }
}

const formatDataStreamPart = (type: "text" | "error", value: string) =>
  `${getDataStreamPrefix(type)}:${JSON.stringify(value) ?? '""'}\n`;

const getDataStreamPrefix = (type: "text" | "error") =>
  type === "text" ? "0" : "3";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return String(error);
};
