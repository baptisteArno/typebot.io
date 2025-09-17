import { FormControl, FormLabel, Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { env } from "@typebot.io/env";
import { isDefined } from "@typebot.io/lib/utils";
import type { Settings } from "@typebot.io/settings/schemas";
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
    <Stack spacing={6}>
      <FormControl>
        <FormLabel display="flex" flexShrink={0} gap="1" mr="0" mb="4">
          {t("settings.sideMenu.security.allowedOrigins")}
          <MoreInfoTooltip>
            {t("settings.sideMenu.security.allowedOrigins.tooltip")}
          </MoreInfoTooltip>
        </FormLabel>
        <TagsInput
          items={security?.allowedOrigins}
          onChange={updateItems}
          placeholder={env.NEXT_PUBLIC_VIEWER_URL[0]}
        />
      </FormControl>
    </Stack>
  );
};
