import { isSvgSrc } from "@typebot.io/lib/utils";
import { cx } from "@typebot.io/ui/lib/cva";
import type { JSX } from "react";

type Props = {
  icon?: string | null;
  size?: "sm" | "md" | "lg";
  defaultIcon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
};

export const EmojiOrImageIcon = ({ icon, size = "md", defaultIcon }: Props) => {
  return (
    <>
      {icon ? (
        icon.startsWith("http") || isSvgSrc(icon) ? (
          <img
            className={cx(
              "rounded-[10%]",
              size === "sm" && "size-[18px]",
              size === "md" && "size-[25px]",
              size === "lg" && "size-[36px]",
              isSvgSrc(icon) ? undefined : "object-cover",
            )}
            src={icon}
            alt="typebot icon"
          />
        ) : (
          <span
            role="img"
            className={cx(
              size === "sm" && "text-xl",
              size === "md" && "text-2xl",
              size === "lg" && "text-[2.25rem]",
            )}
          >
            {icon}
          </span>
        )
      ) : (
        defaultIcon({
          className: cx(
            size === "sm" && "size-4!",
            size === "md" && "size-6!",
            size === "lg" && "size-9!",
          ),
        })
      )}
    </>
  );
};
