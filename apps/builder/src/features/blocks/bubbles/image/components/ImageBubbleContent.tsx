import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";
import { Box, Image, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { ImageBubbleBlock } from "@typebot.io/blocks-bubbles/image/schema";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariableValue";

type Props = {
  block: ImageBubbleBlock;
};

export const ImageBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  const variable = typebot
    ? findUniqueVariable(typebot?.variables)(block.content?.url)
    : null;
  return !block.content?.url ? (
    <Text color={"gray.500"}>{t("clickToEdit")}</Text>
  ) : variable ? (
    <Text>
      Display <VariableTag variableName={variable.name} />
    </Text>
  ) : (
    <Box w="full">
      <Image
        pointerEvents="none"
        src={block.content?.url}
        alt="Group image"
        rounded="md"
        objectFit="cover"
      />
    </Box>
  );
};
