import type { BubbleProps } from "@typebot.io/js";
import type React from "react";
import { useCallback, useEffect, useRef } from "react";
import "@typebot.io/js/web";

type Props = BubbleProps;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "typebot-bubble": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

type BubbleElement = HTMLElement & Props;

export const Bubble = (props: Props) => {
  const bubbleElement = useRef<BubbleElement | null>(null);

  const attachBubbleToDom = useCallback((props: Props) => {
    const newBubbleElement = document.createElement(
      "typebot-bubble",
    ) as BubbleElement;
    bubbleElement.current = newBubbleElement;
    injectPropsToElement(bubbleElement.current, props);
    document.body.prepend(bubbleElement.current);
  }, []);

  useEffect(() => {
    if (!bubbleElement.current) attachBubbleToDom(props);
    injectPropsToElement(bubbleElement.current as BubbleElement, props);
  }, [attachBubbleToDom, props]);

  useEffect(() => {
    return () => {
      bubbleElement.current?.remove();
      bubbleElement.current = null;
    };
  }, []);

  const injectPropsToElement = (element: BubbleElement, props: Props) => {
    Object.assign(element, props);
  };

  return null;
};

export default Bubble;
