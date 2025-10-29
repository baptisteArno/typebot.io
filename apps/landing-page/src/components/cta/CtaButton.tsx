import { cva } from "@typebot.io/ui/lib/cva";

export const ctaButtonVariants = cva("", {
  variants: {
    variant: {
      default:
        "relative overflow-hidden text-white bg-linear-to-b border border-[#C4461D] from-[#FF8963] to-[#FF5A25] to-57% shadow-[inset_0_3px_2px_0_rgba(255,255,255,0.25)] active:from-[#E44A19] active:to-[#EF744C] active:from-43% active:to-100% active:shadow-[inset_0_-2px_2px_0_rgba(255,255,255,0.17)] before:bg-transparent hover:before:bg-white/50 before:w-1/4 before:absolute before:-left-[40%] hover:before:left-[120%] before:transition-[left] before:duration-0 hover:before:duration-700 before:blur-md before:-rotate-45 before:aspect-1/2",
      secondary:
        "relative overflow-hidden text-white bg-linear-to-b border border-gray-950 from-[#282828] to-gray-950 to-57% shadow-[inset_0_3px_2px_0_rgba(255,255,255,0.10)] active:from-gray-950 active:to-[#282828] active:from-43% active:to-100% active:shadow-[inset_0_-3px_2px_0_rgba(255,255,255,0.10)] before:bg-transparent hover:before:bg-white/30 before:w-1/4 before:absolute before:-left-[40%] hover:before:left-[120%] before:transition-[left] before:duration-0 hover:before:duration-700 before:blur-md before:-rotate-45 before:aspect-1/2 ",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
