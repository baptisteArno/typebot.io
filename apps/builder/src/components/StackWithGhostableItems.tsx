import { useHoverExpandDebounce } from "@/features/graph/hooks/useHoverExpandDebounce";
import { Button, Stack, type StackProps } from "@chakra-ui/react";
import { isDefined } from "@typebot.io/lib/utils";
import React, { useMemo } from "react";
import { createContext, forwardRef, useContext } from "react";

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
  } & StackProps
>(({ gapPixel, children, ...props }, ref) => {
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
        React.isValidElement(child) && isDefined(child.props.ghostLabel);
      if (!isGhostableItem) {
        console.error(
          "Child is not a GhostableItem",
          child,
          React.isValidElement(child),
        );
        return;
      }
      const isNull = isGhostableItem && child.props.children === null;

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
    <Stack ref={ref} gap={0} {...props}>
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
    </Stack>
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
      <Stack
        gap={isNullGroup ? (isExpanded ? 1 : 0) : gapPixel + "px"}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        opacity={!isNullGroup || isHovered ? 1 : 0}
        transition="opacity 0.2s ease"
        mb={
          isNullGroup && groups.at(index + 1)?.isNullGroup
            ? gapPixel + "px"
            : undefined
        }
      >
        {children}
      </Stack>
    </StackProvider>
  );
};

export const GhostableItem = ({
  children,
  ghostLabel,
  onGhostClick,
}: {
  children: React.ReactNode;
  ghostLabel: string;
  onGhostClick?: () => void;
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
          h={isExpanded ? "24px" : ghostItemHeight + "px"}
          transition="all 0.2s ease"
          fontSize="12px"
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
