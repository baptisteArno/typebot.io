import { chakra, type IconProps, Image } from "@chakra-ui/react";
import { isSvgSrc } from "@typebot.io/lib/utils";
import { cx } from "@typebot.io/ui/lib/cva";

type Props = {
  icon?: string | null;
  size?: "sm" | "md" | "lg";
  defaultIcon: (props: IconProps) => JSX.Element;
};

export const EmojiOrImageIcon = ({ icon, size = "md", defaultIcon }: Props) => {
  return (
    <>
      {icon ? (
        icon.startsWith("http") || isSvgSrc(icon) ? (
          <Image
            src={icon}
            boxSize={cx(
              size === "sm" && "18px",
              size === "md" && "25px",
              size === "lg" && "36px",
            )}
            objectFit={isSvgSrc(icon) ? undefined : "cover"}
            alt="typebot icon"
            rounded="10%"
          />
        ) : (
          <chakra.span
            role="img"
            className={cx(
              size === "sm" && "text-xl",
              size === "md" && "text-2xl",
              size === "lg" && "text-[2.25rem]",
            )}
          >
            {icon}
          </chakra.span>
        )
      ) : (
        defaultIcon({
          className: cx(
            size === "sm" && "!size-4",
            size === "md" && "!size-6",
            size === "lg" && "!size-9",
          ),
        })
      )}
    </>
  );
};
