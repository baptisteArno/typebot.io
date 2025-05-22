import type { BubbleProps } from "@/features/bubble/components/Bubble";

export const resolveButtonSize = (
  size: NonNullable<NonNullable<BubbleProps["theme"]>["button"]>["size"],
  { isHidden = false }: { isHidden?: boolean } = {},
): `${number}px` => {
  if (isHidden) return "0px";
  if (size === "large") return "64px";
  if (size === "medium" || !size) return "48px";
  const regex = /^\d+px$/;
  if (typeof size === "string" && regex.test(size.trim())) {
    return size.trim() as `${number}px`;
  }
  console.warn(
    "[Typebot] Invalid button size. Use 'medium', 'large' or an explicit pixel string (e.g. '52px').",
  );
  return "48px";
};
