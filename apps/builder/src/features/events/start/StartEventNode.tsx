import { FlagIcon } from "@/components/icons";
import { HStack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";

export const StartEventNode = () => {
  const { t } = useTranslate();

  return (
    <HStack spacing={3}>
      <FlagIcon />
      <Text>{t("editor.blocks.start.text")}</Text>
    </HStack>
  );
};
