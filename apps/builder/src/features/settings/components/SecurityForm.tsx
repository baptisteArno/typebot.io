import { useTranslate } from "@tolgee/react";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import type { Settings } from "@typebot.io/settings/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { TagsInput } from "@/components/TagsInput";

type Props = {
  security: Settings["security"];
  onUpdate: (security: Settings["security"]) => void;
};

export const SecurityForm = ({ security, onUpdate }: Props) => {
  const { t } = useTranslate();
  const updateItems = (items: string[]) => {
    if (items.length === 0) onUpdate(undefined);
    onUpdate({
      allowedOrigins: items.filter(isDefined),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Field.Root>
        <Field.Label>
          {t("settings.sideMenu.security.allowedOrigins")}
          <MoreInfoTooltip>
            {t("settings.sideMenu.security.allowedOrigins.tooltip")}
          </MoreInfoTooltip>
        </Field.Label>
        <TagsInput
          items={security?.allowedOrigins}
          onValueChange={updateItems}
          placeholder={env.NEXT_PUBLIC_VIEWER_URL[0]}
        />
      </Field.Root>
    </div>
  );
};
