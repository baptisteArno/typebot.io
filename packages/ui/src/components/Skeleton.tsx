import { cn } from "../lib/cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gray-7 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
