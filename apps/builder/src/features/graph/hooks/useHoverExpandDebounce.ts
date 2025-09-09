import { useEffect, useState } from "react";

export const useHoverExpandDebounce = (
  { enabled }: { enabled?: boolean } = { enabled: true },
) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (isHovered) {
      const timeout = setTimeout(() => {
        setIsExpanded(true);
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setIsExpanded(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isHovered, enabled]);

  return {
    isExpanded,
    isHovered,
    onHover: () => {
      if (!enabled) return;
      setIsHovered(true);
    },
    onLeave: () => {
      if (!enabled) return;
      setIsHovered(false);
    },
    onAbort: () => {
      if (!enabled) return;
      setIsHovered(false);
      setIsExpanded(false);
    },
  };
};
