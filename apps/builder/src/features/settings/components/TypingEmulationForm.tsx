import { Stack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { isDefined } from "@typebot.io/lib/utils";
import {
  defaultSettings,
  maxTypingEmulationMaxDelay,
} from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import { Field } from "@typebot.io/ui/components/Field";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";

type Props = {
  typingEmulation: Settings["typingEmulation"];
  onUpdate: (typingEmulation: Settings["typingEmulation"]) => void;
};

export const TypingEmulationForm = ({ typingEmulation, onUpdate }: Props) => {
  const { t } = useTranslate();
  const updateIsEnabled = (enabled: boolean) =>
    onUpdate({
      ...typingEmulation,
      enabled,
    });

  const updateSpeed = (speed?: number) =>
    onUpdate({ ...typingEmulation, speed });

  const updateMaxDelay = (maxDelay?: number) =>
    onUpdate({
      ...typingEmulation,
      maxDelay: isDefined(maxDelay)
        ? Math.max(Math.min(maxDelay, 5), 0)
        : undefined,
    });

  const updateIsDisabledOnFirstMessage = (isDisabledOnFirstMessage: boolean) =>
    onUpdate({
      ...typingEmulation,
      isDisabledOnFirstMessage,
    });

  const updateDelayBetweenBubbles = (delayBetweenBubbles?: number) =>
    onUpdate({ ...typingEmulation, delayBetweenBubbles });

  return (
    <Stack spacing={6}>
      <SwitchWithRelatedSettings
        label={t("settings.sideMenu.typing.emulation")}
        initialValue={
          typingEmulation?.enabled ?? defaultSettings.typingEmulation.enabled
        }
        onCheckChange={updateIsEnabled}
      >
        <Field.Root className="flex-row">
          <Field.Label>
            {t("settings.sideMenu.typing.emulation.speed.label")}
          </Field.Label>
          <BasicNumberInput
            defaultValue={
              typingEmulation?.speed ?? defaultSettings.typingEmulation.speed
            }
            onValueChange={updateSpeed}
            withVariableButton={false}
            className="max-w-40"
            step={30}
          />
        </Field.Root>

        <Field.Root className="flex-row inline-flex items-center">
          <Field.Label>
            {t("settings.sideMenu.typing.emulation.maxDelay.label")}
          </Field.Label>
          <BasicNumberInput
            defaultValue={
              typingEmulation?.maxDelay ??
              defaultSettings.typingEmulation.maxDelay
            }
            className="max-w-40"
            onValueChange={updateMaxDelay}
            withVariableButton={false}
            min={0}
            max={maxTypingEmulationMaxDelay}
            step={0.1}
          />
          {t("seconds")}
        </Field.Root>

        <SwitchWithLabel
          label={t(
            "settings.sideMenu.typing.emulation.disabledOnFirstMessage.label",
          )}
          moreInfoContent={t(
            "settings.sideMenu.typing.emulation.disabledOnFirstMessage.tooltip",
          )}
          onCheckChange={updateIsDisabledOnFirstMessage}
          initialValue={
            typingEmulation?.isDisabledOnFirstMessage ??
            defaultSettings.typingEmulation.isDisabledOnFirstMessage
          }
        />
      </SwitchWithRelatedSettings>
      <Field.Root>
        <Field.Label>
          {t("settings.sideMenu.typing.emulation.delayBetweenBubbles")}
        </Field.Label>
        <div className="inline-flex items-center gap-1">
          <BasicNumberInput
            defaultValue={
              typingEmulation?.delayBetweenBubbles ??
              defaultSettings.typingEmulation.delayBetweenBubbles
            }
            className="max-w-40"
            withVariableButton={false}
            onValueChange={updateDelayBetweenBubbles}
            min={0}
            max={5}
          />
          <span>{t("seconds")}</span>
        </div>
      </Field.Root>
    </Stack>
  );
};
