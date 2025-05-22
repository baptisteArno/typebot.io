export type ContainerSize = "sm" | "md" | "lg";

export const getContainerSize = (container: HTMLDivElement): ContainerSize => {
  const width = container.clientWidth;
  if (width < 432) return "sm";
  if (width < 550) return "md";
  return "lg";
};
