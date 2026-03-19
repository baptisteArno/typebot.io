import { cx } from "../lib/cva";

type Props = {
  icon?: string | null;
  className?: string;
  defaultIcon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
};

export const EmojiOrImageIcon = ({ icon, className, defaultIcon }: Props) => {
  if (icon) {
    if (isImageSource(icon)) {
      return (
        <span className={cx("inline-flex shrink-0 items-center justify-center", className)}>
          <img
            className={cx(
              "size-full rounded-[10%]",
              isSvgSource(icon) ? undefined : "object-cover",
            )}
            src={icon}
            alt="typebot icon"
          />
        </span>
      );
    }

    return (
      <span
        role="img"
        className={cx(
          "inline-flex shrink-0 items-center justify-center leading-none text-[1em]",
          className,
        )}
      >
        {icon}
      </span>
    );
  }

  return (
    <span className={cx("inline-flex shrink-0 items-center justify-center", className)}>
      {defaultIcon({ className: "size-full" })}
    </span>
  );
};

const isImageSource = (icon: string) => icon.startsWith("http") || isSvgSource(icon);

const isSvgSource = (icon: string) =>
  icon.startsWith("data:image/svg+xml") || icon.includes(".svg");
