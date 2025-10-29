import { useTranslate } from "@tolgee/react";
import { EventType } from "@typebot.io/events/constants";
import type { CommandEvent } from "@typebot.io/events/schemas";
import { Badge } from "@typebot.io/ui/components/Badge";
import { EventIcon } from "@/features/events/components/EventIcon";

type Props = {
  options: CommandEvent["options"];
};

export const CommandEventNode = ({ options }: Props) => {
  const { t } = useTranslate();

  return (
    <div className="flex items-center gap-3 font-normal">
      <EventIcon type={EventType.COMMAND} />
      {options?.command ? (
        <Badge className="p-2">{options?.command}</Badge>
      ) : (
        <p className="font-normal" color="gray.500">
          {t("configure")}
        </p>
      )}
    </div>
  );
};
