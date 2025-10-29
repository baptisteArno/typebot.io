import type { BubbleProps } from "@typebot.io/js";
import { isLight } from "@typebot.io/lib/hexToRgb";
import { isDefined, isSvgSrc } from "@typebot.io/lib/utils";
import { cx } from "@typebot.io/ui/lib/cva";
import { PreviewMessageSettings } from "./PreviewMessageSettings";
import { ThemeSettings } from "./ThemeSettings";

type Props = {
  defaultPreviewMessageAvatar: string;
  theme: BubbleProps["theme"];
  previewMessage: BubbleProps["previewMessage"];
  onThemeChange: (theme: BubbleProps["theme"]) => void;
  onPreviewMessageChange: (
    previewMessage: BubbleProps["previewMessage"],
  ) => void;
};

export const BubbleSettings = ({
  defaultPreviewMessageAvatar,
  theme,
  previewMessage,
  onThemeChange,
  onPreviewMessageChange,
}: Props) => {
  const updatePreviewMessage = (
    previewMessage: BubbleProps["previewMessage"],
  ) => {
    if (!previewMessage) return onPreviewMessageChange(undefined);
    onPreviewMessageChange({
      ...previewMessage,
      autoShowDelay: previewMessage?.autoShowDelay
        ? previewMessage.autoShowDelay * 1000
        : undefined,
    });
  };

  const updateTheme = (theme: BubbleProps["theme"]) => {
    onThemeChange(theme);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3>Chat bubble settings</h3>
      <div className="flex flex-col pl-4 gap-4">
        <PreviewMessageSettings
          defaultAvatar={defaultPreviewMessageAvatar}
          onChange={updatePreviewMessage}
        />
        <ThemeSettings
          theme={theme}
          onChange={updateTheme}
          isPreviewMessageEnabled={isDefined(previewMessage)}
        />
        <h4>Preview:</h4>
        <div className="flex flex-col gap-2 items-end">
          {isDefined(previewMessage) && (
            <div
              className="flex items-center shadow-md rounded-md p-3 max-w-[280px] gap-4"
              style={{
                backgroundColor: theme?.previewMessage?.backgroundColor,
              }}
            >
              {previewMessage.avatarUrl && (
                <img
                  className="rounded-full size-10 object-cover"
                  src={previewMessage.avatarUrl}
                  alt="Preview message avatar"
                />
              )}
              <p style={{ color: theme?.previewMessage?.textColor }}>
                {previewMessage.message}
              </p>
            </div>
          )}
          <div
            className={cx(
              "flex items-center justify-center rounded-full shadow transition-all",
              theme?.button?.size === "large" ? "size-[64px]" : "size-[48px]",
            )}
            style={{ backgroundColor: theme?.button?.backgroundColor }}
          >
            <BubbleIcon buttonTheme={theme?.button} />
          </div>
        </div>
      </div>
    </div>
  );
};

const BubbleIcon = ({
  buttonTheme,
}: {
  buttonTheme: NonNullable<BubbleProps["theme"]>["button"];
}) => {
  if (!buttonTheme?.customIconSrc)
    return (
      <svg
        viewBox="0 0 24 24"
        style={{
          stroke: buttonTheme?.backgroundColor
            ? isLight(buttonTheme?.backgroundColor)
              ? "#000"
              : "#fff"
            : "#fff",
          transition: "all 0.2s ease-in-out",
        }}
        width={buttonTheme?.size === "large" ? "36px" : "28px"}
        strokeWidth="2px"
        fill="transparent"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    );

  if (
    buttonTheme.customIconSrc.startsWith("http") ||
    buttonTheme.customIconSrc.startsWith("data:image/svg+xml")
  )
    return (
      <img
        src={buttonTheme.customIconSrc}
        className={cx(
          "transition-all",
          isSvgSrc(buttonTheme.customIconSrc)
            ? buttonTheme?.size === "large"
              ? "size-[36px]"
              : "size-[28px]"
            : "size-full object-cover rounded-full",
        )}
        alt="Bubble button icon"
      />
    );
  return (
    <span
      className={cx(
        "transition-all ease-in-out",
        buttonTheme.size === "large" ? "text-3xl" : "text-2xl",
      )}
    >
      {buttonTheme.customIconSrc}
    </span>
  );
};
