import { svgBaseClassName } from "@/components/icons";
import { cn } from "@typebot.io/ui/lib/cn";
import React from "react";

export const ScriptIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn(svgBaseClassName, className)}>
    <polyline points="4 17 10 11 4 5"></polyline>
    <line x1="12" y1="19" x2="20" y2="19"></line>
  </svg>
);
