import { TypingBubble } from "@/components/TypingBubble";
import { parseVariables } from "@/features/variables";
import { useTypebot } from "@/providers/TypebotProvider";
import type { ImageBubbleBlock } from "@typebot.io/blocks-bubbles/image/schema";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  block: ImageBubbleBlock;
  onTransitionEnd: () => void;
};

export const showAnimationDuration = 400;

export const mediaLoadingFallbackTimeout = 5000;

export const ImageBubble = ({ block, onTransitionEnd }: Props) => {
  const { typebot, isLoading } = useTypebot();
  const messageContainer = useRef<HTMLDivElement | null>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const [isTyping, setIsTyping] = useState(true);
  const [url] = useState(parseVariables(typebot.variables)(block.content?.url));

  const onTypingEnd = useCallback(() => {
    setIsTyping(false);
    setTimeout(() => {
      onTransitionEnd();
    }, showAnimationDuration);
  }, [onTransitionEnd]);

  useEffect(() => {
    if (!isTyping || isLoading) return;

    const timeout = setTimeout(() => {
      setIsTyping(false);
      onTypingEnd();
    }, mediaLoadingFallbackTimeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [isLoading, isTyping, onTypingEnd]);

  useEffect(() => {
    const currentImage = image.current;
    if (!currentImage || isLoading || !isTyping) return;
    currentImage.onload = () => {
      setIsTyping(false);
      onTypingEnd();
    };
    return () => {
      currentImage.onload = null;
    };
  }, [isLoading, isTyping, onTypingEnd]);

  return (
    <div className="flex flex-col" ref={messageContainer}>
      <div className="flex mb-2 w-full lg:w-11/12 items-center">
        <div className={"flex relative z-10 items-start typebot-host-bubble"}>
          <div
            className="flex items-center absolute px-4 py-2 rounded-lg bubble-typing z-10 "
            style={{
              width: isTyping ? "4rem" : "100%",
              height: isTyping ? "2rem" : "100%",
            }}
          >
            {isTyping ? <TypingBubble /> : null}
          </div>
          <img
            ref={image}
            src={url}
            className={
              "p-4 content-opacity z-10 w-auto rounded-lg " +
              (isTyping ? "opacity-0" : "opacity-100")
            }
            style={{
              maxHeight: "32rem",
              height: isTyping ? "2rem" : "auto",
              maxWidth: "100%",
            }}
            alt="Bubble image"
          />
        </div>
      </div>
    </div>
  );
};
