import {
  defaultVideoBubbleContent,
  embedBaseUrls,
  embeddableVideoTypes,
  VideoBubbleContentType,
} from "@typebot.io/blocks-bubbles/video/constants";
import { parseQueryParams } from "@typebot.io/blocks-bubbles/video/helpers";
import type {
  EmbeddableVideoBubbleContentType,
  VideoBubbleBlock,
} from "@typebot.io/blocks-bubbles/video/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { createSignal, Match, onCleanup, onMount, Switch } from "solid-js";
import { TypingBubble } from "@/components/TypingBubble";

type Props = {
  content: VideoBubbleBlock["content"];
  onTransitionEnd?: (ref?: HTMLDivElement) => void;
};

export const showAnimationDuration = 400;
let typingTimeout: NodeJS.Timeout;

export const VideoBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined;
  const [isTyping, setIsTyping] = createSignal(
    props.onTransitionEnd ? true : false,
  );

  onMount(() => {
    const typingDuration =
      props.content?.type &&
      embeddableVideoTypes.includes(
        props.content?.type as EmbeddableVideoBubbleContentType,
      )
        ? 2000
        : 100;
    typingTimeout = setTimeout(() => {
      if (!isTyping()) return;
      setIsTyping(false);
      setTimeout(() => {
        props.onTransitionEnd?.(ref);
      }, showAnimationDuration);
    }, typingDuration);
  });

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
  });

  return (
    <div
      class={cx(
        "flex flex-col w-full",
        props.onTransitionEnd ? "animate-fade-in" : undefined,
      )}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div class="flex relative z-10 items-start typebot-host-bubble overflow-hidden w-full max-w-full">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing z-10 "
            style={{
              width: isTyping() ? "64px" : "100%",
              height: isTyping() ? "32px" : "100%",
              "max-width":
                props.content?.maxWidth ?? defaultVideoBubbleContent.maxWidth,
            }}
          >
            {isTyping() && <TypingBubble />}
          </div>
          <Switch>
            <Match
              when={
                props.content?.type &&
                props.content.type === VideoBubbleContentType.URL
              }
            >
              <video
                autoplay={
                  props.onTransitionEnd
                    ? (props.content?.isAutoplayEnabled ??
                      defaultVideoBubbleContent.isAutoplayEnabled)
                    : false
                }
                src={props.content?.url}
                controls={
                  props.content?.areControlsDisplayed ??
                  defaultVideoBubbleContent.areControlsDisplayed
                }
                class={cx(
                  "p-4 focus:outline-none w-full z-10 text-fade-in rounded-md",
                  isTyping() ? "opacity-0 h-8 @xs:h-9" : "opacity-100 h-auto",
                )}
                style={{
                  "aspect-ratio": props.content?.aspectRatio,
                  "max-width":
                    props.content?.maxWidth ??
                    defaultVideoBubbleContent.maxWidth,
                }}
              />
            </Match>
            <Match
              when={
                props.content?.type &&
                embeddableVideoTypes.includes(
                  props.content.type as EmbeddableVideoBubbleContentType,
                )
              }
            >
              <div
                class={cx(
                  "p-4 z-10 text-fade-in w-full aspect-[var(--aspect-ratio)]",
                  isTyping() ? "opacity-0 h-8 @xs:h-9" : "opacity-100",
                  !props.content?.aspectRatio && "h-[var(--height)]",
                )}
                style={{
                  "--aspect-ratio": props.content?.aspectRatio,
                  "--height": `${
                    props.content?.height ?? defaultVideoBubbleContent.height
                  }px`,
                  "max-width":
                    props.content?.maxWidth ??
                    defaultVideoBubbleContent.maxWidth,
                }}
              >
                <iframe
                  src={`${
                    embedBaseUrls[
                      props.content?.type as EmbeddableVideoBubbleContentType
                    ]
                  }/${props.content?.id ?? ""}${
                    props.content?.queryParamsStr ??
                    `?${parseQueryParams(props.content)}`
                  }`}
                  class={"w-full h-full"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                />
              </div>
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};
