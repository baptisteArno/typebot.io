import { isDefined } from "@typebot.io/lib/utils";
import { cn } from "@typebot.io/ui/lib/cn";
import { cx } from "@typebot.io/ui/lib/cva";
import type React from "react";
import { forwardRef } from "react";
import { useHoverExpandDebounce } from "../../hooks/useHoverExpandDebounce";

type Props = {
  isVisible?: boolean;
  isExpanded?: boolean;
  hitboxYExtensionPixels?: number;
  initialHeightPixels?: number;
  expandedHeightPixels?: number;
  initialPaddingPixel?: number;
  expandedPaddingPixel?: number;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};

export const PlaceholderNode = forwardRef<HTMLDivElement, Props>(
  (
    {
      isVisible,
      isExpanded,
      initialHeightPixels = 8,
      expandedHeightPixels = 36,
      initialPaddingPixel = 0,
      expandedPaddingPixel = 6,
      className,
      children,
      onClick,
    },
    ref,
  ) => {
    const {
      isExpanded: isHoverExpanded,
      isHovered,
      onHover,
      onLeave,
      onAbort,
    } = useHoverExpandDebounce({
      enabled: isDefined(onClick),
    });

    return (
      <div
        style={
          {
            "--py":
              isExpanded || isHoverExpanded
                ? expandedPaddingPixel + "px"
                : initialPaddingPixel + "px",
          } as React.CSSProperties
        }
        className={cn(
          "flex font-semibold justify-center items-center relative py-(--py) text-sm",
          className,
        )}
        role="button"
        ref={ref}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        onMouseUpCapture={onAbort}
        onClick={onClick}
      >
        {onClick && <span className="absolute left-0 z-1 w-full" />}
        <div
          style={
            {
              "--h":
                isExpanded || isHoverExpanded
                  ? expandedHeightPixels + "px"
                  : initialHeightPixels + "px",
            } as React.CSSProperties
          }
          className={cx(
            "flex w-full rounded-lg justify-center items-center bg-gray-3 h-(--h) transition-[opacity,height]",
            isVisible || isHovered ? "opacity-100" : "opacity-0",
          )}
        >
          {isHovered && isHoverExpanded ? children : null}
        </div>
      </div>
    );
  },
);

PlaceholderNode.displayName = "PlaceholderNode";
