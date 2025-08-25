import { svgBaseClassName } from "@/components/icons";
import { EditIcon } from "@typebot.io/ui/icons/EditIcon";
import { cn } from "@typebot.io/ui/lib/cn";

export const SetVariableIcon = ({ className }: { className?: string }) => (
  <EditIcon className={cn(svgBaseClassName, className)} />
);
