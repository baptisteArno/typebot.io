import { chatContainerBreakpoints } from "@/constants";
import type { ChatContainerSize } from "@/constants";
import {
  type Accessor,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";

const DEFAULT_CONTAINER_SIZE = "lg" as const;

export const ChatContainerSizeContext = createContext<
  Accessor<ChatContainerSize>
>(() => DEFAULT_CONTAINER_SIZE);

export const useChatContainerSize = () => useContext(ChatContainerSizeContext);

/**
 * Provider that manages bot container and its size with a single ResizeObserver
 */
export const createChatContainerProviderValue = (
  containerAccessor: Accessor<HTMLDivElement | undefined>,
): Accessor<ChatContainerSize> => {
  const [containerSize, setContainerSize] =
    createSignal<ChatContainerSize>("lg");

  const resizeObserver = new ResizeObserver(() => {
    const container = containerAccessor();
    if (container) {
      setContainerSize(getContainerSize(container));
    }
  });

  onMount(() => {
    const container = containerAccessor();
    if (container) {
      setContainerSize(getContainerSize(container));
      resizeObserver.observe(container);
    }
  });

  onCleanup(() => {
    const container = containerAccessor();
    if (container) {
      resizeObserver.unobserve(container);
    }
  });

  return containerSize;
};

const getContainerSize = (container: HTMLDivElement): ChatContainerSize => {
  const width = container.clientWidth;
  if (width < chatContainerBreakpoints.xs) return "xs";
  if (width < chatContainerBreakpoints.sm) return "sm";
  if (width < chatContainerBreakpoints.md) return "md";
  if (width < chatContainerBreakpoints.lg) return "lg";
  return "xl";
};
