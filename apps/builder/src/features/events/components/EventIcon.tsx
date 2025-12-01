import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import { Cancel01Icon } from "@typebot.io/ui/icons/Cancel01Icon";
import { CommandIcon } from "@typebot.io/ui/icons/CommandIcon";
import { Flag02Icon } from "@typebot.io/ui/icons/Flag02Icon";
import { SentIcon } from "@typebot.io/ui/icons/SentIcon";
import { cn } from "@typebot.io/ui/lib/cn";
import type { JSX } from "react";

type Props = { type: TEvent["type"] } & React.SVGProps<SVGSVGElement>;

export const EventIcon = ({
  type,
  className,
  ...props
}: Props): JSX.Element => {
  switch (type) {
    case EventType.START:
      return (
        <Flag02Icon {...props} className={cn(className, "text-gray-12")} />
      );
    case EventType.COMMAND:
      return (
        <CommandIcon {...props} className={cn(className, "text-gray-12")} />
      );
    case EventType.REPLY:
      return <SentIcon {...props} className={cn(className, "text-gray-12")} />;
    case EventType.INVALID_REPLY:
      return (
        <Cancel01Icon {...props} className={cn(className, "text-gray-12")} />
      );
  }
};
