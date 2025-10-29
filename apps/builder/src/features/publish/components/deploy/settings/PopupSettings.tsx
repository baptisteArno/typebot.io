import type { PopupProps } from "@typebot.io/js";
import { isDefined } from "@typebot.io/lib/utils";
import { Switch } from "@typebot.io/ui/components/Switch";
import { cn } from "@typebot.io/ui/lib/cn";
import { useEffect, useState } from "react";
import { BasicNumberInput } from "@/components/inputs/BasicNumberInput";

type Props = {
  onUpdateSettings: (windowSettings: Pick<PopupProps, "autoShowDelay">) => void;
  className?: string;
};

export const PopupSettings = ({ onUpdateSettings, className }: Props) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [inputValue, setInputValue] = useState(5);

  useEffect(() => {
    onUpdateSettings({
      autoShowDelay: isEnabled ? inputValue * 1000 : undefined,
    });
  }, [inputValue, isEnabled, onUpdateSettings]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h3>Popup settings</h3>
      <div className="flex items-center gap-2 pl-4">
        <p className="shrink-0">Auto show</p>
        <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        {isEnabled && (
          <>
            <p>after</p>
            <BasicNumberInput
              className="max-w-40"
              defaultValue={inputValue}
              onValueChange={(val) => isDefined(val) && setInputValue(val)}
              withVariableButton={false}
            />
            <p>seconds</p>
          </>
        )}
      </div>
    </div>
  );
};
