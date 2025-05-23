import {
  type Accessor,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";

export type ContainerSize = "sm" | "md" | "lg";
const DEFAULT_CONTAINER_SIZE = "lg" as const;

export const ChatContainerSizeContext = createContext<Accessor<ContainerSize>>(
  () => DEFAULT_CONTAINER_SIZE,
);

export const useChatContainerSize = () => useContext(ChatContainerSizeContext);

/**
 * Provider that manages bot container and its size with a single ResizeObserver
 */
export const createChatContainerProviderValue = (
  containerAccessor: Accessor<HTMLDivElement | undefined>,
): Accessor<ContainerSize> => {
  const [containerSize, setContainerSize] = createSignal<ContainerSize>("lg");

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

const getContainerSize = (container: HTMLDivElement): ContainerSize => {
  const width = container.clientWidth;
  if (width < 432) return "sm";
  if (width < 550) return "md";
  return "lg";
};
