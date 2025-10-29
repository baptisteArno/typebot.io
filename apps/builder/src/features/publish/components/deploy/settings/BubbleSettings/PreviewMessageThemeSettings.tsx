import type { PreviewMessageTheme } from "@typebot.io/js";
import {
  defaultPreviewMessageBackgroundColor,
  defaultPreviewMessageCloseButtonBackgroundColor,
  defaultPreviewMessageCloseButtonIconColor,
  defaultPreviewMessageTextColor,
} from "@typebot.io/theme/constants";
import { ColorPicker } from "@/components/ColorPicker";

type Props = {
  previewMessageTheme?: PreviewMessageTheme;
  onChange: (newPreviewMessageTheme?: PreviewMessageTheme) => void;
};

export const PreviewMessageThemeSettings = ({
  previewMessageTheme,
  onChange,
}: Props) => {
  const updateBackgroundColor = (backgroundColor: string) => {
    onChange({
      ...previewMessageTheme,
      backgroundColor,
    });
  };

  const updateTextColor = (textColor: string) => {
    onChange({
      ...previewMessageTheme,
      textColor,
    });
  };

  const updateCloseButtonBackgroundColor = (
    closeButtonBackgroundColor: string,
  ) => {
    onChange({
      ...previewMessageTheme,
      closeButtonBackgroundColor,
    });
  };

  const updateCloseButtonIconColor = (closeButtonIconColor: string) => {
    onChange({
      ...previewMessageTheme,
      closeButtonIconColor,
    });
  };

  return (
    <div className="flex flex-col gap-4 border rounded-md p-4">
      <h3>Preview message</h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-between">
          <p>Background color</p>
          <ColorPicker
            defaultValue={
              previewMessageTheme?.backgroundColor ??
              defaultPreviewMessageBackgroundColor
            }
            onColorChange={updateBackgroundColor}
          />
        </div>
        <div className="flex items-center gap-2 justify-between">
          <p>Text color</p>
          <ColorPicker
            defaultValue={
              previewMessageTheme?.textColor ?? defaultPreviewMessageTextColor
            }
            onColorChange={updateTextColor}
          />
        </div>
        <div className="flex items-center gap-2 justify-between">
          <p>Close button background</p>
          <ColorPicker
            defaultValue={
              previewMessageTheme?.closeButtonBackgroundColor ??
              defaultPreviewMessageCloseButtonBackgroundColor
            }
            onColorChange={updateCloseButtonBackgroundColor}
          />
        </div>
        <div className="flex items-center gap-2 justify-between">
          <p>Close icon color</p>
          <ColorPicker
            defaultValue={
              previewMessageTheme?.closeButtonIconColor ??
              defaultPreviewMessageCloseButtonIconColor
            }
            onColorChange={updateCloseButtonIconColor}
          />
        </div>
      </div>
    </div>
  );
};
