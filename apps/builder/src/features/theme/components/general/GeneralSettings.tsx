import { Stack, useDisclosure } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
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
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Field } from "@typebot.io/ui/components/Field";
import { Label } from "@typebot.io/ui/components/Label";
import { Radio, RadioGroup } from "@typebot.io/ui/components/RadioGroup";
import { Switch } from "@typebot.io/ui/components/Switch";
import { ChangePlanDialog } from "@/features/billing/components/ChangePlanDialog";
import { LockTag } from "@/features/billing/components/LockTag";
import { isFreePlan } from "@/features/billing/helpers/isFreePlan";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useWorkspace } from "@/features/workspace/WorkspaceProvider";
import { trpc } from "@/lib/queryClient";
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

  const { mutate: trackClientEvents } = useMutation(
    trpc.telemetry.trackClientEvents.mutationOptions(),
  );

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
      <ChangePlanDialog
        isOpen={isOpen}
        onClose={onClose}
        type={t("billing.limitMessage.brand")}
      />
      <Field.Root
        className="flex-row items-center justify-between"
        onClick={isWorkspaceFreePlan ? onOpen : undefined}
      >
        <Field.Label>
          {t("theme.sideMenu.global.typebotBrand")}{" "}
          {isWorkspaceFreePlan && <LockTag plan={Plan.STARTER} />}
        </Field.Label>
        <Switch checked={isBrandingEnabled} onCheckedChange={updateBranding} />
      </Field.Root>
      {typebot && (
        <ProgressBarForm
          progressBar={generalTheme?.progressBar}
          onProgressBarChange={updateProgressBar}
          typebotVersion={typebot.version}
        />
      )}
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>
            {t("theme.sideMenu.global.font")}
          </Accordion.Trigger>
          <Accordion.Panel>
            <RadioGroup
              defaultValue={fontType}
              onValueChange={(value) =>
                updateFontType(value as (typeof fontTypes)[number])
              }
            >
              {fontTypes.map((type) => (
                <Label
                  key={type}
                  className="hover:bg-gray-2/50 rounded-md p-2 border flex-1 flex justify-center"
                >
                  <Radio value={type} className="hidden" />
                  {type}
                </Label>
              ))}
            </RadioGroup>
            <FontForm font={generalTheme?.font} onFontChange={updateFont} />
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Trigger>
            {t("theme.sideMenu.global.background")}
          </Accordion.Trigger>
          <Accordion.Panel>
            <BackgroundSelector
              background={generalTheme?.background}
              onBackgroundChange={handleBackgroundChange}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};
