import { isDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { cn } from "@typebot.io/ui/lib/cn";
import { cx } from "@typebot.io/ui/lib/cva";
import React, { createContext, forwardRef, useContext, useMemo } from "react";
import { useHoverExpandDebounce } from "@/features/graph/hooks/useHoverExpandDebounce";

const context = createContext<
  | {
      isExpanded: boolean;
      ghostItemHeight: number;
      closeExpanded: () => void;
    }
  | undefined
>(undefined);

const useStackWithGhostableItems = () => useContext(context);

const StackProvider = ({
  children,
  isExpanded,
  ghostItemHeight,
  closeExpanded,
}: {
  children: React.ReactNode;
  isExpanded: boolean;
  ghostItemHeight: number;
  closeExpanded: () => void;
}) => {
  return (
    <context.Provider value={{ isExpanded, ghostItemHeight, closeExpanded }}>
      {children}
    </context.Provider>
  );
};

export const StacksWithGhostableItems = forwardRef<
  HTMLDivElement,
  {
    gapPixel: number;
    className?: string;
    children: React.ReactNode;
  }
>(({ gapPixel, children, className }, ref) => {
  const childrenArray = React.Children.toArray(children);

  const childrenGroups = useMemo(() => {
    const groupedChildren: {
      children: React.ReactNode[];
      isNullGroup: boolean;
    }[] = [];
    let currentGroup: React.ReactNode[] = [];
    let inNullGroup = false;

    childrenArray.forEach((child) => {
      const isGhostableItem =
        React.isValidElement(child) &&
        isDefined((child.props as any).ghostLabel);
      if (!isGhostableItem) {
        console.error(
          "Child is not a GhostableItem",
          child,
          React.isValidElement(child),
        );
        return;
      }
      const isNull = isGhostableItem && (child.props as any).children === null;

      if ((isNull && !inNullGroup) || (!isNull && inNullGroup)) {
        if (currentGroup.length > 0) {
          groupedChildren.push({
            children: currentGroup,
            isNullGroup: inNullGroup,
          });
        }
        currentGroup = [child];
        inNullGroup = isNull;
      } else {
        currentGroup.push(child);
      }
    });

    if (currentGroup.length > 0) {
      groupedChildren.push({
        children: currentGroup,
        isNullGroup: inNullGroup,
      });
    }

    return groupedChildren;
  }, [childrenArray]);

  return (
    <div className={cn("flex flex-col gap-0", className)} ref={ref}>
      {childrenGroups.map((group, index) => (
        <StackWithGhostableItems
          key={`${group.isNullGroup}-${index}`}
          gapPixel={gapPixel}
          groups={childrenGroups}
          index={index}
        >
          {group.children}
        </StackWithGhostableItems>
      ))}
    </div>
  );
});

const StackWithGhostableItems = ({
  children,
  gapPixel,
  index,
  groups,
}: {
  children: React.ReactNode;
  gapPixel: number;
  index: number;
  groups: { isNullGroup: boolean }[];
}) => {
  const isNullGroup = groups.at(index)?.isNullGroup;

  const { isHovered, isExpanded, onHover, onLeave, onAbort } =
    useHoverExpandDebounce({
      enabled: isNullGroup,
    });

  const childrenLength = React.Children.count(children);

  return (
    <StackProvider
      isExpanded={isExpanded}
      ghostItemHeight={gapPixel / childrenLength}
      closeExpanded={onAbort}
    >
      <div
        style={
          {
            "--gap": (isNullGroup ? (isExpanded ? 1 : 0) : gapPixel) + "px",
            "--mb": gapPixel + "px",
          } as React.CSSProperties
        }
        className={cx(
          "flex flex-col gap-(--gap) transition-opacity",
          !isNullGroup || isHovered ? "opacity-100" : "opacity-0",
          isNullGroup && groups.at(index + 1)?.isNullGroup
            ? "mb-(--mb)"
            : undefined,
        )}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
      >
        {children}
      </div>
    </StackProvider>
  );
};

export const GhostableItem = ({
  children,
  ghostLabel,
  onGhostClick,
  className,
}: {
  children: React.ReactNode;
  ghostLabel: string;
  onGhostClick?: () => void;
  className?: string;
}) => {
  const context = useStackWithGhostableItems();
  if (!context)
    throw new Error(
      "GhostableItem must be used within StackWithGhostableItems",
    );
  const { isExpanded, ghostItemHeight, closeExpanded } = context;

  return (
    <>
      {children === null ? (
        <Button
          variant="secondary"
          style={
            {
              "--available-height": isExpanded
                ? "24px"
                : ghostItemHeight + "px",
            } as React.CSSProperties
          }
          className={cn(
            "transition-all duration-200 h-(--available-height) text-xs py-0",
            className,
          )}
          onClick={() => {
            onGhostClick?.();
            closeExpanded();
          }}
        >
          {isExpanded ? ghostLabel : null}
        </Button>
      ) : (
        children
      )}
    </>
  );
};

StacksWithGhostableItems.displayName = "StacksWithGhostableItems";
GhostableItem.displayName = "GhostableItem";
StackWithGhostableItems.displayName = "StackWithGhostableItems";
