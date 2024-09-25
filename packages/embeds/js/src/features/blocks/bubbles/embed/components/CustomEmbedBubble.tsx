import { TypingBubble } from "@/components/TypingBubble";
import { executeCode } from "@/features/blocks/logic/script/executeScript";
import type { InputSubmitContent } from "@/types";
import { botContainerHeight } from "@/utils/botContainerHeightSignal";
import { isMobile } from "@/utils/isMobileSignal";
import type { CustomEmbedBubble as CustomEmbedBubbleProps } from "@typebot.io/bot-engine/schemas/api";
import clsx from "clsx";
import { createSignal, onCleanup, onMount } from "solid-js";

type Props = {
  content: CustomEmbedBubbleProps["content"];
  onTransitionEnd?: (ref?: HTMLDivElement) => void;
  onCompleted: (reply?: InputSubmitContent) => void;
};

let typingTimeout: NodeJS.Timeout;

export const showAnimationDuration = 400;

export const CustomEmbedBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined;
  const [isTyping, setIsTyping] = createSignal(
    props.onTransitionEnd ? true : false,
  );
  let containerRef: HTMLDivElement | undefined;

  onMount(() => {
    executeCode({
      args: {
        ...props.content.initFunction.args,
        typebotElement: containerRef,
      },
      content: props.content.initFunction.content,
    });

    if (props.content.waitForEventFunction)
      executeCode({
        args: {
          ...props.content.waitForEventFunction.args,
          continueFlow: (text: string) =>
            props.onCompleted(text ? { type: "text", value: text } : undefined),
        },
        content: props.content.waitForEventFunction.content,
      });

    typingTimeout = setTimeout(() => {
      setIsTyping(false);
      setTimeout(() => props.onTransitionEnd?.(ref), showAnimationDuration);
    }, 2000);
  });

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
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
              "p-2 z-20 text-fade-in w-full",
              isTyping() ? "opacity-0" : "opacity-100",
            )}
            style={{
              height: isTyping() ? (isMobile() ? "32px" : "36px") : undefined,
            }}
          >
            <div
              class="w-full overflow-y-auto"
              style={{ "max-height": `calc(${botContainerHeight()} - 100px)` }}
              ref={containerRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
