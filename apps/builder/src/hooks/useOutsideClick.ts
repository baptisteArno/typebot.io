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
      const clickedElement = event.target as HTMLElement;
      const el = ref?.current;
      if (
        !el ||
        el.contains(clickedElement) ||
        ignoreSelectors?.some((selector) => clickedElement.closest(selector))
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
  }, [capture, handler, isEnabled, ref]);
};
