import { useTranslate } from "@tolgee/react";
import { IconPicker as IconPickerPrimitive } from "@typebot.io/ui/components/IconPicker";
import { useThemeValue } from "@/hooks/useThemeValue";

type Props = {
  onIconSelected: (url: string) => void;
};

export const IconPicker = ({ onIconSelected }: Props) => {
  const initialIconColor = useThemeValue("#222222", "#ffffff");
  const { t } = useTranslate();

  return (
    <IconPickerPrimitive.Root
      onIconSelected={onIconSelected}
      defaultColor={initialIconColor}
    >
      <div className="flex items-center gap-2">
        <IconPickerPrimitive.SearchInput
          placeholder={t("emojiList.searchInput.placeholder")}
        />
        <IconPickerPrimitive.ColorPicker />
      </div>
      <IconPickerPrimitive.List />
    </IconPickerPrimitive.Root>
  );
};
