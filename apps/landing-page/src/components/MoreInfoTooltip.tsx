import { Tooltip, TooltipAnchor, TooltipProvider } from "@ariakit/react";
import { CircleHelpIcon } from "@typebot.io/ui/icons/CircleHelpIcon";

type Props = {
  children: React.ReactNode;
};
export const MoreInfoTooltip = ({ children }: Props) => {
  return (
    <TooltipProvider timeout={0}>
      <TooltipAnchor render={(props) => <span {...props} />}>
        <CircleHelpIcon className="size-4 inline-flex" />
      </TooltipAnchor>
      <Tooltip className="bg-gray-1 p-4 border border-gray-6 shadow-md max-w-sm rounded-md text-sm">
        {children}
      </Tooltip>
    </TooltipProvider>
  );
};
