import { svgBaseClassName } from "@/components/icons";
import { cn } from "@typebot.io/ui/lib/cn";
import React from "react";

export const JumpIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn(svgBaseClassName, className)}>
    <polygon points="13 19 22 12 13 5 13 19"></polygon>
    <polygon points="2 19 11 12 2 5 2 19"></polygon>
  </svg>
);
