import { Popover } from "@typebot.io/ui/components/Popover";
import { InformationSquareIcon } from "../icons/InformationSquareIcon";

type Props = {
  children: React.ReactNode;
  icon?: React.ReactElement;
  onClick?: () => void;
  documentationUrl?: string;
};

export const MoreInfoTooltip = ({
  children,
  icon,
  onClick,
  documentationUrl,
}: Props) => {
  return (
    <Popover.Root openOnHover delay={0} closeDelay={100}>
      <Popover.Trigger
        className="p-1 pb-0.5 align-bottom inline-flex [&>svg]:size-4 [&>svg]:text-gray-11"
        onClick={onClick}
      >
        {icon || <InformationSquareIcon />}
      </Popover.Trigger>
      <Popover.Popup
        side="top"
        className="max-w-xs px-3 py-2 text-sm"
        offset={8}
      >
        {children}
        {documentationUrl && (
          <a
            href={documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-1 text-blue-11 hover:underline"
          >
            Learn more
          </a>
        )}
      </Popover.Popup>
    </Popover.Root>
  );
};
