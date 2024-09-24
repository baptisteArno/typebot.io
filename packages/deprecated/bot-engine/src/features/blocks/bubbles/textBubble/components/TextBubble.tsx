import { TypingBubble } from "@/components/TypingBubble";
import { parseVariables } from "@/features/variables";
import { useTypebot } from "@/providers/TypebotProvider";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { TextBubbleBlock } from "@typebot.io/blocks-bubbles/text/schema";
import { useCallback, useEffect, useRef, useState } from "react";
import { computeTypingDuration } from "../utils/computeTypingDuration";

type Props = {
  block: TextBubbleBlock;
  onTransitionEnd: () => void;
};

export const showAnimationDuration = 400;

export const TextBubble = ({ block, onTransitionEnd }: Props) => {
  const { typebot, isLoading } = useTypebot();
  const messageContainer = useRef<HTMLDivElement | null>(null);
  const [isTyping, setIsTyping] = useState(true);

  const [content] = useState(
    parseVariables(typebot.variables)(block.content?.html),
  );

  const onTypingEnd = useCallback(() => {
    setIsTyping(false);
    setTimeout(() => {
      onTransitionEnd();
    }, showAnimationDuration);
  }, [onTransitionEnd]);

  useEffect(() => {
    if (!isTyping || isLoading) return;

    const typingTimeout = computeTypingDuration({
      bubbleContent: block.content?.plainText ?? "",
      typingSettings: typebot.settings?.typingEmulation,
    });
    const timeout = setTimeout(() => {
      onTypingEnd();
    }, typingTimeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    block.content?.plainText,
    isLoading,
    isTyping,
    onTypingEnd,
    typebot.settings?.typingEmulation,
  ]);

  return (
    <div className="flex flex-col" ref={messageContainer}>
      <div className="flex mb-2 w-full items-center">
        <div className={"flex relative items-start typebot-host-bubble"}>
          <div
            className="flex items-center absolute px-4 py-2 rounded-lg bubble-typing "
            style={{
              width: isTyping ? "4rem" : "100%",
              height: isTyping ? "2rem" : "100%",
            }}
            data-testid="host-bubble"
          >
            {isTyping ? <TypingBubble /> : null}
          </div>
          {block.type === BubbleBlockType.TEXT && (
            <p
              style={{
                textOverflow: "ellipsis",
              }}
              className={
                "overflow-hidden content-opacity mx-4 my-2 whitespace-pre-wrap slate-html-container relative " +
                (isTyping ? "opacity-0 h-6" : "opacity-100 h-full")
              }
              dangerouslySetInnerHTML={{
                __html: content,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
