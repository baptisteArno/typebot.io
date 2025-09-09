import {
  type BoxProps,
  Flex,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { forwardRef } from "react";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";
import { ImageIcon } from "./icons";

export const ImageOrPlaceholder = forwardRef<
  HTMLDivElement,
  BoxProps & { src?: string }
>(({ src, ...props }, ref) => {
  const { typebot } = useTypebot();
  const emptyImageBgColor = useColorModeValue("gray.100", "gray.700");
  const variable = typebot ? findUniqueVariable(typebot?.variables)(src) : null;

  if (variable)
    return (
      <Flex
        ref={ref}
        bgColor={emptyImageBgColor}
        rounded="md"
        justify="center"
        align="center"
        {...props}
        h="75px"
      >
        <VariableTag variableName={variable.name} />
      </Flex>
    );

  if (src)
    return (
      <Image
        ref={ref}
        rounded="md"
        userSelect="none"
        draggable={false}
        src={src}
        objectFit="cover"
        {...props}
      />
    );

  return (
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
