import { svgBaseClassName } from "@/components/icons";
import { cn } from "@typebot.io/ui/lib/cn";
import React from "react";

export const ReturnBlockIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn(svgBaseClassName, className)}>
    <path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
    <path d="M3 7v6h6" />
    <circle cx="12" cy="17" r="1" />
  </svg>
);
