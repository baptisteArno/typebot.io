import type { RefObject } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Options = boolean | (AddEventListenerOptions & { debug?: boolean });
// MediaQueryList Event based useEventListener interface
function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element: RefObject<MediaQueryList>,
  options?: Options,
  deps?: unknown[],
): void;

// Window Event based useEventListener interface
function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: Options,
  deps?: unknown[],
): void;

// Element Event based useEventListener interface
function useEventListener<
  K extends keyof HTMLElementEventMap,
  T extends HTMLElement = HTMLDivElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: RefObject<T>,
  options?: Options,
  deps?: unknown[],
): void;

// Document Event based useEventListener interface
function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: RefObject<Document>,
  options?: Options,
  deps?: unknown[],
): void;

function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  KM extends keyof MediaQueryListEventMap,
  T extends HTMLElement | MediaQueryList | void = void,
>(
  eventName: KW | KH | KM,
  handler: (
    event:
      | WindowEventMap[KW]
      | HTMLElementEventMap[KH]
      | MediaQueryListEventMap[KM]
      | Event,
  ) => void,
  element?: RefObject<T>,
  options?: Options,
  deps: unknown[] = [],
) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);

  useIsomorphicLayoutEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Define the listening target
    if (element && !element.current) return;

    const targetElement: T | Window = element?.current ?? window;

    if (!(targetElement && targetElement.addEventListener)) return;

    if (options && typeof options !== "boolean")
      console.log("Add event listener", {
        elementText: (targetElement as HTMLElement).textContent,
        eventName,
        element: targetElement,
        options,
      });
    // Create event listener that calls handler function stored in ref
    const listener: typeof handler = (event) => savedHandler.current(event);

    targetElement.addEventListener(eventName, listener, options);

    // Remove event listener on cleanup
    return () => {
      if (options && typeof options !== "boolean")
        console.log("Remove event listener", {
          elementText: (targetElement as HTMLElement).textContent,
          eventName,
          element: targetElement,
          options,
        });
      targetElement.removeEventListener(eventName, listener, options);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName, ...deps]);
}

export { useEventListener };
