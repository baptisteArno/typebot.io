import { cx } from "class-variance-authority";
import type { ClassValue } from "class-variance-authority/types";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "border-w": ["border-host-bubble"],
      "border-color": ["border-host-bubble-border"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(cx(inputs));
}
