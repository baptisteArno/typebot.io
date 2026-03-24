import type { RefObject } from "react";
import { useEffect } from "react";

type Handler = (event: MouseEvent) => void;

type Props<T> = {
  ref: RefObject<T | null>;
  handler: Handler;
  capture?: boolean;
  isEnabled?: boolean;
  ignoreSelectors?: string[];
};

export const useOutsideClick = <T extends HTMLElement = HTMLElement>({
  ref,
  handler,
  capture,
  isEnabled,
  ignoreSelectors,
}: Props<T>): void => {
  useEffect(() => {
    if (isEnabled === false) return;

    const triggerHandlerIfOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      const clickedNode = event.target;
      const clickedElement =
        event.target instanceof Element ? event.target : undefined;
      const element = ref.current;
      if (
        !element ||
        element.contains(clickedNode) ||
        ignoreSelectors?.some((selector) => clickedElement?.closest(selector))
      ) {
        return;
      }
      handler(event);
    };

    document.addEventListener("pointerdown", triggerHandlerIfOutside, {
      capture,
    });
    return () => {
      document.removeEventListener("pointerdown", triggerHandlerIfOutside, {
        capture,
      });
    };
  }, [capture, handler, ignoreSelectors, isEnabled, ref]);
};
