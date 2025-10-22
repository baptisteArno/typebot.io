import { HStack, Text, useColorModeValue } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Badge } from "@typebot.io/ui/components/Badge";
import type { Variable } from "@typebot.io/variables/schemas";

export const SetVariableLabel = ({
  variableId,
  variables,
}: {
  variableId: string;
  variables?: Variable[];
}) => {
  const { t } = useTranslate();
  const textColor = useColorModeValue("gray.600", "gray.400");
  const variableName = variables?.find(
    (variable) => variable.id === variableId,
  )?.name;

  if (!variableName) return null;
  return (
    <HStack fontStyle="italic" spacing={1}>
      <Text fontSize="sm" color={textColor}>
        {t("variables.set")}
      </Text>
      <Badge colorScheme="purple" className="break-all">
        {variableName}
      </Badge>
    </HStack>
  );
};
