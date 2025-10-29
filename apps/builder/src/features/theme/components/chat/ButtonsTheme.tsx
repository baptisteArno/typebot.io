import { useTranslate } from "@tolgee/react";
import type { Theme } from "@typebot.io/theme/schemas";
import { ColorPicker } from "../../../../components/ColorPicker";

type Props = {
  buttons: NonNullable<Theme["chat"]>["buttons"];
  onButtonsChange: (buttons: NonNullable<Theme["chat"]>["buttons"]) => void;
};

export const ButtonsTheme = ({ buttons, onButtonsChange }: Props) => {
  const { t } = useTranslate();

  const handleBackgroundChange = (backgroundColor: string) =>
    onButtonsChange({ ...buttons, backgroundColor });
  const handleTextChange = (color: string) =>
    onButtonsChange({ ...buttons, color });

  return (
    <div className="flex flex-col gap-2" data-testid="buttons-theme">
      <div className="flex justify-between items-center">
        <p>{t("theme.sideMenu.chat.theme.background")}</p>
        <ColorPicker
          value={buttons?.backgroundColor}
          onColorChange={handleBackgroundChange}
        />
      </div>
      <div className="flex justify-between items-center">
        <p>{t("theme.sideMenu.chat.theme.text")}</p>
        <ColorPicker value={buttons?.color} onColorChange={handleTextChange} />
      </div>
    </div>
  );
};
