import { Icon } from "../components/Icon";
import { cn } from "../lib/cn";

export const LoaderCircleIcon = ({ className }: { className?: string }) => (
  <Icon className={cn("size-7", className)}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Icon>
);
