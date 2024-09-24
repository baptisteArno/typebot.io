import { RadioButtons } from "@/components/inputs/RadioButtons";
import { ChangePlanModal } from "@/features/billing/components/ChangePlanModal";
import { LockTag } from "@/features/billing/components/LockTag";
import { isFreePlan } from "@/features/billing/helpers/isFreePlan";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/trpc";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  FormLabel,
  Stack,
  Switch,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { env } from "@typebot.io/env";
import { Plan } from "@typebot.io/prisma/enum";
import { defaultFontType, fontTypes } from "@typebot.io/theme/constants";
import type {
  Background,
  Font,
  ProgressBar,
  Theme,
} from "@typebot.io/theme/schemas";
import React from "react";
import { BackgroundSelector } from "./BackgroundSelector";
import { FontForm } from "./FontForm";
import { ProgressBarForm } from "./ProgressBarForm";

type Props = {
  isBrandingEnabled: boolean;
  generalTheme: Theme["general"];
  onGeneralThemeChange: (general: Theme["general"]) => void;
  onBrandingChange: (isBrandingEnabled: boolean) => void;
};

export const GeneralSettings = ({
  isBrandingEnabled,
  generalTheme,
  onGeneralThemeChange,
  onBrandingChange,
}: Props) => {
  const { t } = useTranslate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { workspace } = useWorkspace();
  const { typebot } = useTypebot();
  const isWorkspaceFreePlan = isFreePlan(workspace);

  const { mutate: trackClientEvents } =
    trpc.telemetry.trackClientEvents.useMutation();

  const updateFont = (font: Font) =>
    onGeneralThemeChange({ ...generalTheme, font });

  const updateFontType = (type: (typeof fontTypes)[number]) => {
    onGeneralThemeChange({
      ...generalTheme,
      font:
        typeof generalTheme?.font === "string"
          ? { type }
          : { ...generalTheme?.font, type },
    });
  };

  const handleBackgroundChange = (background: Background) =>
    onGeneralThemeChange({ ...generalTheme, background });

  const updateProgressBar = (progressBar: ProgressBar) =>
    onGeneralThemeChange({ ...generalTheme, progressBar });

  const updateBranding = () => {
    if (isBrandingEnabled && isWorkspaceFreePlan) return;
    if (
      env.NEXT_PUBLIC_POSTHOG_KEY &&
      typebot &&
      workspace &&
      isBrandingEnabled
    ) {
      trackClientEvents({
        events: [
          {
            name: "Branding removed",
            typebotId: typebot.id,
            workspaceId: workspace.id,
          },
        ],
      });
    }
    onBrandingChange(!isBrandingEnabled);
  };

  const fontType =
    (typeof generalTheme?.font === "string"
      ? "Google"
      : generalTheme?.font?.type) ?? defaultFontType;

  return (
    <Stack spacing={6}>
      <ChangePlanModal
        isOpen={isOpen}
        onClose={onClose}
        type={t("billing.limitMessage.brand")}
      />
      <Flex
        justifyContent="space-between"
        align="center"
        onClick={isWorkspaceFreePlan ? onOpen : undefined}
      >
        <FormLabel htmlFor="branding" mb="0" cursor="pointer">
          {t("theme.sideMenu.global.typebotBrand")}{" "}
          {isWorkspaceFreePlan && <LockTag plan={Plan.STARTER} />}
        </FormLabel>
        <Switch
          id="branding"
          isChecked={isBrandingEnabled}
          onChange={updateBranding}
        />
      </Flex>
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            Progress Bar
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <ProgressBarForm
              progressBar={generalTheme?.progressBar}
              onProgressBarChange={updateProgressBar}
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            {t("theme.sideMenu.global.font")}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel as={Stack}>
            <RadioButtons
              options={fontTypes}
              defaultValue={fontType}
              onSelect={updateFontType}
            />
            <FontForm font={generalTheme?.font} onFontChange={updateFont} />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            {t("theme.sideMenu.global.background")}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <BackgroundSelector
              background={generalTheme?.background}
              onBackgroundChange={handleBackgroundChange}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
};
