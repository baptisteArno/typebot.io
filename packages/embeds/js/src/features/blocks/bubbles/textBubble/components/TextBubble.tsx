import { TypingBubble } from "@/components/TypingBubble";
import { isMobile } from "@/utils/isMobileSignal";
import type { TextBubbleBlock } from "@typebot.io/blocks-bubbles/text/schema";
import { computeTypingDuration } from "@typebot.io/bot-engine/computeTypingDuration";
import type { Settings } from "@typebot.io/settings/schemas";
import clsx from "clsx";
import { For, createSignal, onCleanup, onMount } from "solid-js";
import { computePlainText } from "../helpers/convertRichTextToPlainText";
import { PlateElement } from "./plate/PlateBlock";

type Props = {
  content: TextBubbleBlock["content"];
  typingEmulation: Settings["typingEmulation"];
  isTypingSkipped: boolean;
  onTransitionEnd?: (ref?: HTMLDivElement) => void;
};

export const showAnimationDuration = 400;

let typingTimeout: NodeJS.Timeout;

export const TextBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined;
  const [isTyping, setIsTyping] = createSignal(
    props.onTransitionEnd ? true : false,
  );

  const onTypingEnd = () => {
    if (!isTyping()) return;
    setIsTyping(false);
    setTimeout(() => {
      props.onTransitionEnd?.(ref);
    }, showAnimationDuration);
  };

  onMount(() => {
    if (!isTyping) return;
    const plainText = props.content?.richText
      ? computePlainText(props.content.richText)
      : "";
    const typingDuration =
      props.typingEmulation?.enabled === false || props.isTypingSkipped
        ? 0
        : computeTypingDuration({
            bubbleContent: plainText,
            typingSettings: props.typingEmulation,
          });
    typingTimeout = setTimeout(onTypingEnd, typingDuration);
  });

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
  });

  return (
    <div
      class={clsx(
        "flex flex-col",
        props.onTransitionEnd ? "animate-fade-in" : undefined,
      )}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div class="flex relative items-start typebot-host-bubble max-w-full">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing "
            style={{
              width: isTyping() ? "64px" : "100%",
              height: isTyping() ? "32px" : "100%",
            }}
            data-testid="host-bubble"
          >
            {isTyping() && <TypingBubble />}
          </div>
          <div
            class={clsx(
              "overflow-hidden text-fade-in mx-4 my-2 whitespace-pre-wrap slate-html-container relative text-ellipsis",
              isTyping() ? "opacity-0" : "opacity-100",
            )}
            style={{
              height: isTyping() ? (isMobile() ? "16px" : "20px") : "100%",
            }}
          >
            <For each={props.content?.richText}>
              {(element) => <PlateElement element={element} />}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};
