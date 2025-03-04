import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { NumberInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { isDefined } from "@typebot.io/lib/utils";
import { defaultSettings } from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import React from "react";

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
        <NumberInput
          label={t("settings.sideMenu.typing.emulation.speed.label")}
          data-testid="speed"
          defaultValue={
            typingEmulation?.speed ?? defaultSettings.typingEmulation.speed
          }
          onValueChange={updateSpeed}
          withVariableButton={false}
          maxW="100px"
          step={30}
          direction="row"
        />
        <HStack>
          <NumberInput
            label={t("settings.sideMenu.typing.emulation.maxDelay.label")}
            data-testid="max-delay"
            defaultValue={
              typingEmulation?.maxDelay ??
              defaultSettings.typingEmulation.maxDelay
            }
            onValueChange={updateMaxDelay}
            withVariableButton={false}
            maxW="100px"
            step={0.1}
            direction="row"
            size="sm"
          />
          <Text>{t("seconds")}</Text>
        </HStack>

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
      <HStack>
        <NumberInput
          label={t("settings.sideMenu.typing.emulation.delayBetweenBubbles")}
          defaultValue={
            typingEmulation?.delayBetweenBubbles ??
            defaultSettings.typingEmulation.delayBetweenBubbles
          }
          withVariableButton={false}
          onValueChange={updateDelayBetweenBubbles}
          direction="row"
          maxW={"100px"}
          min={0}
          max={5}
          size="sm"
        />
        <Text>{t("seconds")}</Text>
      </HStack>
    </Stack>
  );
};
