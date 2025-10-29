import type {
  BubbleProps,
  BubbleTheme,
  ButtonTheme,
  PreviewMessageTheme,
} from "@typebot.io/js";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { ButtonThemeSettings } from "./ButtonThemeSettings";
import { PreviewMessageThemeSettings } from "./PreviewMessageThemeSettings";

type Props = {
  isPreviewMessageEnabled: boolean;
  theme: BubbleProps["theme"];
  onChange: (newBubbleTheme: BubbleProps["theme"]) => void;
};

export const ThemeSettings = ({
  isPreviewMessageEnabled,
  theme,
  onChange,
}: Props) => {
  const updateButtonTheme = (button?: ButtonTheme) => {
    onChange({
      ...theme,
      button,
    });
  };

  const updatePreviewMessageTheme = (previewMessage?: PreviewMessageTheme) => {
    onChange({
      ...theme,
      previewMessage,
    });
  };

  const updatePlacement = (placement: BubbleTheme["placement"]) => {
    onChange({
      ...theme,
      placement,
    });
  };

  return (
    <Accordion.Root>
      <Accordion.Item>
        <Accordion.Trigger>Theme</Accordion.Trigger>
        <Accordion.Panel>
          <div className="flex items-center gap-2 justify-between">
            <p>Placement</p>
            <BasicSelect
              size="sm"
              value={theme?.placement}
              defaultValue="right"
              items={[
                { value: "right", label: "Right" },
                { value: "left", label: "Left" },
              ]}
              onChange={updatePlacement}
            />
          </div>
          <ButtonThemeSettings
            buttonTheme={theme?.button}
            onChange={updateButtonTheme}
          />
          {isPreviewMessageEnabled ? (
            <PreviewMessageThemeSettings
              previewMessageTheme={theme?.previewMessage}
              onChange={updatePreviewMessageTheme}
            />
          ) : null}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
};
