import { Portal } from "@ark-ui/react/portal";
import { Tooltip } from "@ark-ui/react/tooltip";
import { CircleHelpIcon } from "@typebot.io/ui/icons/CircleHelpIcon";

type Props = {
  children: React.ReactNode;
};
export const MoreInfoTooltip = ({ children }: Props) => {
  return (
    <Tooltip.Root openDelay={0} closeDelay={0}>
      <Tooltip.Trigger>
        <CircleHelpIcon className="size-4 inline-flex" />
      </Tooltip.Trigger>
      <Portal>
        <Tooltip.Positioner>
          <Tooltip.Content className="bg-gray-1 p-4 border border-gray-6 shadow-md max-w-sm rounded-md text-sm data-[state=open]:motion-opacity-in-0 data-[state=open]:motion-translate-y-in-[-5px] motion-duration-300">
            {children}
          </Tooltip.Content>
        </Tooltip.Positioner>
      </Portal>
    </Tooltip.Root>
  );
};
