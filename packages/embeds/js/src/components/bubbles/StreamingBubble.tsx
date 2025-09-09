import { isNotEmpty } from "@typebot.io/lib/utils";
import domPurify from "dompurify";
import { marked } from "marked";
import { createMemo, For } from "solid-js";
import type { ChatChunk } from "@/types";

type Props = {
  content: NonNullable<ChatChunk["streamingMessage"]>;
};

export const StreamingBubble = (props: Props) => {
  marked.use({
    renderer: {
      link: (href, _title, text) => {
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
      },
    },
  });

  const formattedContent = createMemo(() => {
    if (Array.isArray(props.content)) return props.content;
    return (
      props.content
        .split("```")
        .flatMap((block, index) => {
          if (index % 2 === 0) {
            return block.split("\n\n").map((line) =>
              domPurify.sanitize(
                marked.parse(
                  line
                    .replace(/【.+】/g, "")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;"),
                  {
                    breaks: true,
                  },
                ),
                {
                  ADD_ATTR: ["target"],
                },
              ),
            );
          } else {
            return [
              domPurify.sanitize(
                marked.parse(
                  "```" +
                    block +
                    "```".replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                  {
                    breaks: true,
                  },
                ),
                {
                  ADD_ATTR: ["target"],
                },
              ),
            ];
          }
        })
        ?.filter(isNotEmpty) ?? []
    );
  });

  return (
    <div class="flex flex-col animate-fade-in typebot-streaming-container">
      <div class="flex w-full items-center">
        <div class="flex relative items-start typebot-host-bubble max-w-full">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing "
            style={{
              width: "100%",
              height: "100%",
            }}
            data-testid="host-bubble"
          />
          <div
            class={
              "flex flex-col overflow-hidden text-fade-in mx-4 my-2 relative text-ellipsis h-full gap-6"
            }
          >
            <For each={formattedContent()}>
              {(line) => <span innerHTML={line} />}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};
