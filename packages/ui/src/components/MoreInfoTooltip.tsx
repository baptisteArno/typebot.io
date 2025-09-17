import { Popover } from "@typebot.io/ui/components/Popover";
import { InfoIcon } from "@typebot.io/ui/icons/InfoIcon";

type Props = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
};

export const MoreInfoTooltip = ({ children, icon, onClick }: Props) => {
  return (
    <Popover.Root openOnHover delay={0} closeDelay={100}>
      <Popover.Trigger
        className="p-1 pl-0 inline-flex align-middle [&>svg]:size-4 [&>svg]:text-gray-11"
        onClick={onClick}
      >
        {icon || <InfoIcon />}
      </Popover.Trigger>
      <Popover.Popup
        side="top"
        className="max-w-xs px-3 py-2 text-sm"
        offset={8}
      >
        {children}
      </Popover.Popup>
    </Popover.Root>
  );
};
