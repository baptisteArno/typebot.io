import { EditIcon } from "@typebot.io/ui/icons/EditIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import { svgBaseClassName } from "@/components/icons";

export const SetVariableIcon = ({ className }: { className?: string }) => (
  <EditIcon className={cn(svgBaseClassName, className)} />
);
