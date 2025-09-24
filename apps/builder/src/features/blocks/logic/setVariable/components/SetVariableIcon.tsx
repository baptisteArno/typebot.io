import { Edit03Icon } from "@typebot.io/ui/icons/Edit03Icon";
import { cn } from "@typebot.io/ui/lib/cn";
import { svgBaseClassName } from "@/components/icons";

export const SetVariableIcon = ({ className }: { className?: string }) => (
  <Edit03Icon className={cn(svgBaseClassName, className)} />
);
