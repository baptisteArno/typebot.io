import { cn } from "@typebot.io/ui/lib/cn";
import { svgBaseClassName } from "@/components/icons";

export const WaitIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn(svgBaseClassName, className)}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);
