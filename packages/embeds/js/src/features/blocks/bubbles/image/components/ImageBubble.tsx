import { Modal } from "@/components/Modal";
import { TypingBubble } from "@/components/TypingBubble";
import { isMobile } from "@/utils/isMobileSignal";
import { defaultImageBubbleContent } from "@typebot.io/blocks-bubbles/image/constants";
import type { ImageBubbleBlock } from "@typebot.io/blocks-bubbles/image/schema";
import { cx } from "@typebot.io/ui/lib/cva";
import { createSignal, onCleanup, onMount } from "solid-js";

type Props = {
  content: ImageBubbleBlock["content"];
  onTransitionEnd?: (ref?: HTMLDivElement) => void;
};

export const showAnimationDuration = 400;

export const mediaLoadingFallbackTimeout = 5000;

let typingTimeout: NodeJS.Timeout;

export const ImageBubble = (props: Props) => {
  let ref: HTMLDivElement | undefined;
  let image: HTMLImageElement | undefined;
  const [isExpanded, setIsExpanded] = createSignal(false);
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
    if (!image) return;
    typingTimeout = setTimeout(onTypingEnd, mediaLoadingFallbackTimeout);
    image.onload = () => {
      clearTimeout(typingTimeout);
      onTypingEnd();
    };
  });

  onCleanup(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
  });

  const openModal = () => {
    setIsExpanded(true);
  };

  const closeModal = () => {
    setIsExpanded(false);
  };

  const Image = (
    <img
      ref={image}
      src={props.content?.url}
      alt={
        props.content?.clickLink?.alt ?? defaultImageBubbleContent.clickLink.alt
      }
      class={cx(
        isTyping() ? "opacity-0" : "opacity-100",
        props.onTransitionEnd ? "text-fade-in" : undefined,
        props.content?.url?.endsWith(".svg") ? "w-full" : undefined,
      )}
      style={{
        width: props.content?.url?.startsWith("data:image/svg")
          ? "100%"
          : undefined,
        "max-height": props.content?.url?.startsWith("data:image/svg")
          ? "120px"
          : "512px",
        height: isTyping() ? "32px" : "auto",
      }}
      elementtiming={"Bubble image"}
      fetchpriority={"high"}
    />
  );

  return (
    <div
      class={cx(
        "flex flex-col",
        props.onTransitionEnd ? "animate-fade-in" : undefined,
      )}
      ref={ref}
    >
      <div class="flex w-full items-center">
        <div class="flex relative z-10 items-start typebot-host-bubble max-w-full">
          <div
            class="flex items-center absolute px-4 py-2 bubble-typing z-10 "
            style={{
              width: isTyping() ? "64px" : "100%",
              height: isTyping() ? "32px" : "100%",
            }}
          >
            {isTyping() ? <TypingBubble /> : null}
          </div>
          {props.content?.clickLink ? (
            <a
              href={props.content.clickLink.url}
              target="_blank"
              class={cx("z-10", isTyping() ? "h-8" : "p-4")}
              rel="noreferrer"
            >
              {Image}
            </a>
          ) : (
            <figure
              class={cx(
                "z-10 cursor-pointer",
                !isTyping() && "p-4",
                isTyping() ? (isMobile() ? "h-8" : "h-9") : "",
              )}
              on:click={
                props.content?.url?.startsWith("data:image/svg")
                  ? undefined
                  : openModal
              }
            >
              {Image}
            </figure>
          )}
        </div>
      </div>
      <Modal isOpen={isExpanded()} onClose={closeModal}>
        <img
          src={props.content?.url}
          alt={
            props.content?.clickLink?.alt ??
            defaultImageBubbleContent.clickLink.alt
          }
          class="max-h-[calc(100vh-1rem)] max-w-[calc(100%-1rem)] rounded-[6px] m-auto"
        />
      </Modal>
    </div>
  );
};
