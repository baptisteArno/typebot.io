import { Box, Flex, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { LocationBubbleBlock } from "@typebot.io/blocks-bubbles/location/schema";
import { findUniqueVariable } from "@typebot.io/variables/findUniqueVariable";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { VariableTag } from "@/features/graph/components/nodes/block/VariableTag";

type Props = {
  block: LocationBubbleBlock;
};

export const LocationBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot();
  const { t } = useTranslate();
  
  const latitudeVariable = typebot
    ? findUniqueVariable(typebot?.variables)(block.content?.latitude?.toString())
    : null;
  
  const longitudeVariable = typebot
    ? findUniqueVariable(typebot?.variables)(block.content?.longitude?.toString())
    : null;

  if (!block.content?.latitude && !block.content?.longitude) {
    return <Text color={"gray.500"}>{t("clickToEdit")}</Text>;
  }

  if (latitudeVariable || longitudeVariable) {
    return (
      <Flex gap={2} align="center">
        <Text>Location:</Text>
        {latitudeVariable && <VariableTag variableName={latitudeVariable.name} />}
        {latitudeVariable && longitudeVariable && <Text>,</Text>}
        {longitudeVariable && <VariableTag variableName={longitudeVariable.name} />}
      </Flex>
    );
  }

  return (
    <Box w="full">
      <Flex direction="column" gap={1}>
        <Text fontWeight="medium">
          {block.content?.name || "Location"}
        </Text>
        {block.content?.address && (
          <Text fontSize="sm" color="gray.500">
            {block.content.address}
          </Text>
        )}
        <Text fontSize="xs" color="gray.400">
          {block.content?.latitude}, {block.content?.longitude}
        </Text>
      </Flex>
    </Box>
  );
};