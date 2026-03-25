import { cn } from "../lib/cn";
import { cx } from "../lib/cva";

type Props = {
  icon?: string | null;
  className?: string;
  defaultIcon: React.ReactNode;
};

export const EmojiOrImageIcon = ({ icon, className, defaultIcon }: Props) => {
  const isEmoji = icon && !isImageSource(icon);
  return (
    <span
      role={isEmoji ? "img" : undefined}
      className={cn(
        "inline-flex items-center align-middle",
        isEmoji && "leading-none",
        className,
      )}
    >
      {icon ? (
        isImageSource(icon) ? (
          <img
            className={cx(
              "size-full rounded-[10%]",
              isSvgSource(icon) ? undefined : "object-cover",
            )}
            src={icon}
            alt="typebot icon"
          />
        ) : (
          icon
        )
      ) : (
        defaultIcon
      )}
    </span>
  );
};

const isImageSource = (icon: string) =>
  icon.startsWith("http") || isSvgSource(icon);

const isSvgSource = (icon: string) =>
  icon.startsWith("data:image/svg+xml") || icon.endsWith(".svg");
