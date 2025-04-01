import { TextInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { OnMessageEvent } from "@typebot.io/events/schemas";
export const OnMessageEventSettings = ({
  options,
  onOptionsChange,
}: {
  options: OnMessageEvent["options"];
  onOptionsChange: (options: OnMessageEvent["options"]) => void;
}) => {
  const { t } = useTranslate();

  return (
    <Stack>
      <TextInput
        placeholder={t("blocks.events.onMessage.settings.message.placeholder")}
        defaultValue={options?.message}
        onChange={(message) => onOptionsChange({ ...options, message })}
      />
      <SwitchWithLabel
        label={t("blocks.events.onMessage.settings.resumeAfter.label")}
        initialValue={options?.resumeAfter}
        onCheckChange={(resumeAfter) =>
          onOptionsChange({ ...options, resumeAfter })
        }
      />
    </Stack>
  );
};
