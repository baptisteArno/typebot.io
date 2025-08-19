import { cva } from "../lib/cva";

export const inputVariants = cva(
  `flex w-full min-w-0 relative overflow-visible rounded-md border transition-[box-shadow,border-color] border-gray-6 bg-transparent
focus:outline-none focus:ring-orange-8 focus:ring-2 focus:border-transparent focus:z-10
disabled:cursor-not-allowed disabled:opacity-50
hover:border-gray-7`,
  {
    variants: {
      variant: {
        default: "h-9 px-3 py-1 text-base md:text-sm",
        noSize: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
