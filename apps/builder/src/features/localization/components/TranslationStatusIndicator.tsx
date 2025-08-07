import { Circle, Progress, Tooltip } from "@chakra-ui/react";
import React from "react";

interface TranslationStatusIndicatorProps {
  completeness: number; // 0-100
  size?: "xs" | "sm" | "md";
  variant?: "dot" | "progress" | "badge";
}

export const TranslationStatusIndicator = ({
  completeness,
  size = "sm",
  variant = "dot",
}: TranslationStatusIndicatorProps) => {
  const getColor = (completeness: number) => {
    if (completeness >= 100) return "green.500";
    if (completeness >= 50) return "yellow.500";
    return "red.500";
  };

  const getTooltipText = (completeness: number) => {
    if (completeness >= 100) return "Translation complete";
    if (completeness === 0) return "Not translated";
    return `${completeness}% translated`;
  };

  const sizeMap = {
    xs: 2,
    sm: 3,
    md: 4,
  };

  const color = getColor(completeness);
  const tooltipText = getTooltipText(completeness);

  if (variant === "dot") {
    return (
      <Tooltip label={tooltipText}>
        <Circle size={sizeMap[size]} bg={color} />
      </Tooltip>
    );
  }

  if (variant === "progress") {
    return (
      <Tooltip label={tooltipText}>
        <Progress
          value={completeness}
          size={size}
          colorScheme={color.split(".")[0]}
          min={0}
          max={100}
          w="60px"
          rounded="full"
        />
      </Tooltip>
    );
  }

  // Badge variant
  return (
    <Tooltip label={tooltipText}>
      <Circle size={6} bg={color} color="white" fontSize="xs" fontWeight="bold">
        {completeness}%
      </Circle>
    </Tooltip>
  );
};
