import {
  type BoxProps,
  Flex,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { forwardRef } from "react";
import { ImageIcon } from "./icons";

export const ImageOrPlaceholder = forwardRef<
  HTMLDivElement,
  BoxProps & { src?: string }
>(({ src, ...props }, ref) => {
  const emptyImageBgColor = useColorModeValue("gray.100", "gray.700");
  return src ? (
    <Image
      ref={ref}
      rounded="md"
      userSelect="none"
      draggable={false}
      src={src}
      objectFit="cover"
      {...props}
    />
  ) : (
    <Flex
      ref={ref}
      bgColor={emptyImageBgColor}
      rounded="md"
      justify="center"
      align="center"
      {...props}
    >
      <ImageIcon />
    </Flex>
  );
});

ImageOrPlaceholder.displayName = "ImageOrPlaceholder";
