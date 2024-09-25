import { ToolIcon } from "@/components/icons";
import { type IconProps, Image, chakra } from "@chakra-ui/react";
import { isSvgSrc } from "@typebot.io/lib/utils";
import React from "react";

type Props = {
  icon?: string | null;
  emojiFontSize?: string;
  boxSize?: string;
  defaultIcon?: (props: IconProps) => JSX.Element;
};

export const EmojiOrImageIcon = ({
  icon,
  boxSize = "25px",
  emojiFontSize,
  defaultIcon = ToolIcon,
}: Props) => {
  return (
    <>
      {icon ? (
        icon.startsWith("http") || isSvgSrc(icon) ? (
          <Image
            src={icon}
            boxSize={boxSize}
            objectFit={isSvgSrc(icon) ? undefined : "cover"}
            alt="typebot icon"
            rounded="10%"
          />
        ) : (
          <chakra.span role="img" fontSize={emojiFontSize}>
            {icon}
          </chakra.span>
        )
      ) : (
        defaultIcon({ boxSize })
      )}
    </>
  );
};
