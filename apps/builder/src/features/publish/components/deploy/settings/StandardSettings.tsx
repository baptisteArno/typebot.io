import { Field } from "@typebot.io/ui/components/Field";
import { Input } from "@typebot.io/ui/components/Input";
import { Switch } from "@typebot.io/ui/components/Switch";
import { cn } from "@typebot.io/ui/lib/cn";
import { useEffect, useState } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";

type Props = {
  onUpdateWindowSettings: (windowSettings: {
    heightLabel: string;
    widthLabel?: string;
  }) => void;
  className?: string;
};

export const StandardSettings = ({
  onUpdateWindowSettings,
  className,
}: Props) => {
  const [isFullscreenChecked, setIsFullscreenChecked] = useState(false);
  const [inputValues, setInputValues] = useState({
    widthValue: "100",
    widthType: "%",
    heightValue: "600",
    heightType: "px",
  });

  useEffect(() => {
    onUpdateWindowSettings({
      widthLabel: isFullscreenChecked
        ? undefined
        : inputValues.widthValue + inputValues.widthType,
      heightLabel: isFullscreenChecked
        ? "100vh"
        : inputValues.heightValue + inputValues.heightType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValues, isFullscreenChecked]);

  const handleWidthTypeSelect = (widthType: string) =>
    setInputValues({ ...inputValues, widthType });
  const handleHeightTypeSelect = (heightType: string) =>
    setInputValues({ ...inputValues, heightType });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h3>Window settings</h3>
      <div className="flex flex-col pl-4 gap-4">
        <Field.Root className="flex-row items-center">
          <Switch
            checked={isFullscreenChecked}
            onCheckedChange={() => setIsFullscreenChecked(!isFullscreenChecked)}
          />
          <Field.Label>Set to fullscreen</Field.Label>
        </Field.Root>
        {!isFullscreenChecked && (
          <>
            <div className="flex justify-between items-center">
              <p>Width</p>
              <div className="flex items-center gap-2">
                <Input
                  onValueChange={(value) =>
                    setInputValues({
                      ...inputValues,
                      widthValue: value,
                    })
                  }
                  className="w-[70px]"
                  value={inputValues.widthValue}
                />
                <BasicSelect
                  items={["px", "%"]}
                  onChange={handleWidthTypeSelect}
                  value={inputValues.widthType}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <p>Height</p>
              <div className="flex items-center gap-2">
                <Input
                  onValueChange={(value) =>
                    setInputValues({
                      ...inputValues,
                      heightValue: value,
                    })
                  }
                  className="w-[70px]"
                  value={inputValues.heightValue}
                />
                <BasicSelect
                  items={["px", "%"]}
                  onChange={handleHeightTypeSelect}
                  value={inputValues.heightType}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
