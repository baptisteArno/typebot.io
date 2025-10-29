import { useTranslate } from "@tolgee/react";
import {
  type ButtonProps,
  buttonVariants,
} from "@typebot.io/ui/components/Button";
import { Input } from "@typebot.io/ui/components/Input";
import { Popover } from "@typebot.io/ui/components/Popover";
import { useOpenControls } from "@typebot.io/ui/hooks/useOpenControls";
import type React from "react";
import { useId, useState } from "react";
import tinyColor from "tinycolor2";
import { useDebouncedCallback } from "use-debounce";

const colorsSelection: `#${string}`[] = [
  "#666460",
  "#FFFFFF",
  "#A87964",
  "#D09C46",
  "#DE8031",
  "#598E71",
  "#4A8BB2",
  "#9B74B7",
  "#C75F96",
  "#0042DA",
];

type Props = {
  value?: string;
  defaultValue?: string;
  isDisabled?: boolean;
  onColorChange: (color: string) => void;
  side?: "top" | "bottom" | "left" | "right";
};

export const ColorPicker = ({
  value,
  defaultValue,
  isDisabled,
  side = "right",
  onColorChange,
}: Props) => {
  const { t } = useTranslate();
  const [color, setColor] = useState(defaultValue ?? "");
  const displayedValue = value ?? color;
  const controls = useOpenControls();

  const handleColorChange = (color: string) => {
    setColor(color);
    onColorChange(color);
  };

  const handleClick = (color: string) => () => {
    setColor(color);
    onColorChange(color);
  };

  return (
    <Popover.Root {...controls}>
      <Popover.TriggerButton
        aria-label={t("colorPicker.pickColor.ariaLabel")}
        variant="secondary"
        size="icon"
        className="min-w-0 rounded-md border"
        disabled={isDisabled}
      >
        <div
          className="rounded-full size-[14px]"
          style={{ backgroundColor: displayedValue }}
        />
      </Popover.TriggerButton>
      <Popover.Popup className="p-0 max-w-48" side={side}>
        <div
          className="h-24"
          style={{
            backgroundColor: displayedValue,
            color: tinyColor(displayedValue).isLight() ? "gray.900" : "white",
          }}
        >
          <div className="flex items-center justify-center h-full">
            {displayedValue}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-2">
          <div className="grid gap-2 grid-cols-[repeat(5,1fr)]">
            {colorsSelection.map((color) => (
              <button
                key={color}
                aria-label={color}
                style={
                  {
                    "--bg": color,
                    "--border-width": color === "#FFFFFF" ? "1px" : "0px",
                  } as React.CSSProperties
                }
                className="h-5 w-5 p-0 min-w-0 rounded-md border-(length:--border-width) bg-(--bg) hover:bg-(--bg)"
                onClick={handleClick(color)}
              />
            ))}
          </div>
          <Input
            className="rounded-sm mt-3"
            placeholder="#2a9d8f"
            aria-label={t("colorPicker.colorValue.ariaLabel")}
            size="sm"
            value={displayedValue}
            onValueChange={handleColorChange}
          />
          <NativeColorPicker
            size="sm"
            color={displayedValue}
            onColorChange={handleColorChange}
          >
            {t("colorPicker.advancedColors")}
          </NativeColorPicker>
        </div>
      </Popover.Popup>
    </Popover.Root>
  );
};

const NativeColorPicker = ({
  color,
  onColorChange,
  variant,
  size,
  ...props
}: {
  color: string;
  onColorChange: (color: string) => void;
} & ButtonProps) => {
  const inputId = useId();
  const debouncedOnColorChange = useDebouncedCallback((color: string) => {
    onColorChange(color);
  }, 200);

  return (
    <>
      <label htmlFor={inputId} className={buttonVariants({ variant, size })}>
        {props.children}
      </label>
      <input
        type="color"
        className="hidden"
        id={inputId}
        value={color}
        onChange={(e) => debouncedOnColorChange(e.target.value)}
      />
    </>
  );
};
