import { useTranslate } from "@tolgee/react";
import { GraphNavigation } from "@typebot.io/prisma/enum";
import { Label } from "@typebot.io/ui/components/Label";
import { Radio, RadioGroup } from "@typebot.io/ui/components/RadioGroup";
import { LaptopIcon, MouseIcon } from "@/components/icons";

type Props = {
  defaultValue: string;
  onChange: (value: string) => void;
};
export const GraphNavigationRadioGroup = ({
  defaultValue,
  onChange,
}: Props) => {
  const { t } = useTranslate();
  const graphNavigationData = [
    {
      value: GraphNavigation.MOUSE,
      label: t("account.preferences.graphNavigation.mouse.label"),
      description: t("account.preferences.graphNavigation.mouse.description"),
      icon: <MouseIcon boxSize="35px" />,
    },
    {
      value: GraphNavigation.TRACKPAD,
      label: t("account.preferences.graphNavigation.trackpad.label"),
      description: t(
        "account.preferences.graphNavigation.trackpad.description",
      ),
      icon: <LaptopIcon boxSize="35px" />,
    },
  ];
  return (
    <RadioGroup
      onValueChange={(value) => onChange(value as string)}
      defaultValue={defaultValue}
      className="gap-2"
    >
      {graphNavigationData.map((option) => (
        <Label
          key={option.value}
          className="border rounded-md p-6 gap-6 justify-between items-center flex-col flex hover:bg-gray-2/50"
        >
          <div className="flex flex-col gap-6 justify-center items-center">
            {option.icon}
            <div className="flex flex-col gap-2">
              <span>{option.label}</span>
              <span className="font-normal">{option.description}</span>
            </div>
          </div>

          <Radio value={option.value} id={option.label} />
        </Label>
      ))}
    </RadioGroup>
  );
};
