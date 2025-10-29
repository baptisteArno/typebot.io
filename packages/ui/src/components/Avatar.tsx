import { Avatar as AvatarPrimitive } from "@base-ui-components/react/avatar";
import { cn } from "../lib/cn";

function Root({ className, ...props }: AvatarPrimitive.Root.Props) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-1 align-middle text-xs font-medium select-none",
        className,
      )}
      {...props}
    />
  );
}

function Image({ className, ...props }: AvatarPrimitive.Image.Props) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("size-full object-cover", className)}
      {...props}
    />
  );
}

function Fallback({ className, ...props }: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-gray-4",
        className,
      )}
      {...props}
    />
  );
}

export const Avatar = {
  Root,
  Image,
  Fallback,
};
