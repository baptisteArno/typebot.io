import { Box, Image, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { ImageBubbleBlock } from "@typebot.io/blocks-bubbles/image/schema";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";

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
        maxH={
          block.content?.url.startsWith("data:image/svg") ? "80px" : undefined
        }
        rounded="md"
        objectFit="cover"
      />
    </Box>
  );
};
