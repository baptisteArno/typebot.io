import { cx } from "class-variance-authority";
import type { ClassValue } from "class-variance-authority/types";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "border-w": ["border-host-bubble", "border-button", "border-input"],
      "border-color": [
        "border-host-bubble-border",
        "border-button-border",
        "border-input-border",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(cx(inputs));
}
