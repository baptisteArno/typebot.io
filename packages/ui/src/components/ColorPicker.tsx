import type * as React from "react";
import { useId, useRef, useState } from "react";
import { useOpenControls } from "../hooks/useOpenControls";
import { type ButtonProps, buttonVariants } from "./Button";
import { Input } from "./Input";
import { Popover } from "./Popover";

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

const isLightColor = (hex: string) => {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

type Props = {
  value?: string;
  defaultValue?: string;
  isDisabled?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  advancedColorsLabel?: string;
  onColorChange: (color: string) => void;
};

export const ColorPicker = ({
  value,
  defaultValue,
  isDisabled,
  side = "right",
  advancedColorsLabel = "Advanced colors",
  onColorChange,
}: Props) => {
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
            color: isLightColor(displayedValue) ? "black" : "white",
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
                type="button"
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
            size="sm"
            value={displayedValue}
            onValueChange={handleColorChange}
          />
          <NativeColorPicker
            size="sm"
            color={displayedValue}
            onColorChange={handleColorChange}
          >
            {advancedColorsLabel}
          </NativeColorPicker>
        </div>
      </Popover.Popup>
    </Popover.Root>
  );
};

const NativeColorPicker = ({
  color,
  variant,
  size,
  onColorChange,
  ...props
}: {
  color: string;
  onColorChange: (color: string) => void;
} & ButtonProps) => {
  const inputId = useId();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const debouncedOnColorChange = (color: string) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => onColorChange(color), 200);
  };

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
