import { useTranslate } from "@tolgee/react";
import { Label } from "@typebot.io/ui/components/Label";
import { Radio, RadioGroup } from "@typebot.io/ui/components/RadioGroup";

type Props = {
  defaultValue: string;
  onChange: (value: string) => void;
};

export const AppearanceRadioGroup = ({ defaultValue, onChange }: Props) => {
  const { t } = useTranslate();

  const appearanceData = [
    {
      value: "light",
      label: t("account.preferences.appearance.lightLabel"),
      image: "/images/light-mode.png",
    },
    {
      value: "dark",
      label: t("account.preferences.appearance.darkLabel"),
      image: "/images/dark-mode.png",
    },
    {
      value: "system",
      label: t("account.preferences.appearance.systemLabel"),
      image: "/images/system-mode.png",
    },
  ];
  return (
    <RadioGroup
      onValueChange={(value) => onChange(value as string)}
      defaultValue={defaultValue}
      className="gap-2"
    >
      {appearanceData.map((option) => (
        <Label
          key={option.value}
          className="flex flex-col gap-5 w-full justify-between border rounded-md pb-6 hover:bg-gray-2/50"
        >
          <img className="rounded-sm" src={option.image} alt="Theme preview" />
          <div className="flex gap-2 items-center">
            <Radio value={option.value} id={option.label} />
            <div className="flex flex-col gap-2">{option.label}</div>
          </div>
        </Label>
      ))}
    </RadioGroup>
  );
};
