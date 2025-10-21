import { Image02Icon } from "@typebot.io/ui/icons/Image02Icon";
import { cn } from "@typebot.io/ui/lib/cn";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { forwardRef } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";

export const ImageOrPlaceholder = forwardRef<
  HTMLDivElement | HTMLImageElement,
  { src?: string; className?: string; alt?: string }
>(({ src, className, ...props }, ref) => {
  const { typebot } = useTypebot();
  const variable = typebot ? findUniqueVariable(typebot?.variables)(src) : null;

  if (variable)
    return (
      <div
        className={cn(
          "bg-gray-2 rounded-md flex items-center justify-center h-[75px]",
          className,
        )}
        ref={ref}
        {...props}
      >
        <VariableTag variableName={variable.name} />
      </div>
    );

  if (src)
    return (
      <img
        className={cn(
          "object-cover size-full rounded-md select-none",
          className,
        )}
        ref={ref as any}
        src={src}
        alt="Image"
      />
    );

  return (
    <div
      ref={ref}
      className={cn(
        "bg-gray-2 rounded-md flex items-center justify-center",
        className,
      )}
    >
      <Image02Icon className="size-4" />
    </div>
  );
});

ImageOrPlaceholder.displayName = "ImageOrPlaceholder";
