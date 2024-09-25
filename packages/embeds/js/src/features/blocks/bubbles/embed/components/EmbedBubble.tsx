import { TypingBubble } from "@/components/TypingBubble";
import type { InputSubmitContent } from "@/types";
import { isMobile } from "@/utils/isMobileSignal";
import { defaultEmbedBubbleContent } from "@typebot.io/blocks-bubbles/embed/constants";
import type { EmbedBubbleBlock } from "@typebot.io/blocks-bubbles/embed/schema";
import { isNotEmpty } from "@typebot.io/lib/utils";
import clsx from "clsx";
import { createSignal, onCleanup, onMount } from "solid-js";

type Props = {
  content: EmbedBubbleBlock["content"];
  onTransitionEnd?: (ref?: HTMLDivElement) => void;
  onCompleted?: (data?: InputSubmitContent) => void;
};

let typingTimeout: NodeJS.Timeout;

export const showAnimationDuration = 400;

export const EmbedBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined;
  const [isTyping, setIsTyping] = createSignal(
    props.onTransitionEnd ? true : false,
  );

  const handleMessage = (
    event: MessageEvent<{ name?: string; data?: string }>,
  ) => {
    if (
      props.content?.waitForEvent?.isEnabled &&
      isNotEmpty(event.data.name) &&
      event.data.name === props.content?.waitForEvent.name
    ) {
      props.onCompleted?.(
        props.content.waitForEvent.saveDataInVariableId && event.data.data
          ? {
              type: "text",
              value: event.data.data,
            }
          : undefined,
      );
      window.removeEventListener("message", handleMessage);
    }
  };

  onMount(() => {
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      if (props.content?.waitForEvent?.isEnabled) {
        window.addEventListener("message", handleMessage);
      }
      setTimeout(() => {
        props.onTransitionEnd?.(ref);
      }, showAnimationDuration);
    }, 2000);
  });

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
    window.removeEventListener("message", handleMessage);
  });

  return (
    <div
      class={clsx(
        "flex flex-col w-full",
        props.onTransitionEnd ? "animate-fade-in" : undefined,
      )}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div class="flex relative z-10 items-start typebot-host-bubble w-full max-w-full">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing z-10 "
            style={{
              width: isTyping() ? "64px" : "100%",
              height: isTyping() ? "32px" : "100%",
            }}
          >
            {isTyping() && <TypingBubble />}
          </div>
          <div
            class={clsx(
              "p-4 z-20 text-fade-in w-full",
              isTyping() ? "opacity-0" : "opacity-100 p-4",
            )}
            style={{
              height: isTyping()
                ? isMobile()
                  ? "32px"
                  : "36px"
                : `${
                    props.content?.height ?? defaultEmbedBubbleContent.height
                  }px`,
            }}
          >
            <iframe
              id="embed-bubble-content"
              src={props.content?.url}
              class={"w-full h-full "}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
