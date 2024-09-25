import { PlusIcon } from "@/components/icons";
import { Button, type ButtonProps, Text, VStack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { useRouter } from "next/router";
import { stringify } from "qs";
import React from "react";
import { useTypebotDnd } from "../TypebotDndProvider";

export const CreateBotButton = ({
  folderId,
  ...props
}: { folderId?: string } & ButtonProps) => {
  const { t } = useTranslate();
  const router = useRouter();
  const { draggedTypebot } = useTypebotDnd();

  const handleClick = () =>
    router.push(
      `/typebots/create?${stringify({
        folderId,
      })}`,
    );

  return (
    <Button
      style={{ width: "225px", height: "270px" }}
      onClick={handleClick}
      paddingX={6}
      whiteSpace={"normal"}
      colorScheme="blue"
      opacity={draggedTypebot ? 0.3 : 1}
      {...props}
    >
      <VStack spacing="6">
        <PlusIcon fontSize="40px" />
        <Text
          fontSize={18}
          fontWeight="medium"
          maxW={40}
          textAlign="center"
          mt="6"
        >
          {t("folders.createTypebotButton.label")}
        </Text>
      </VStack>
    </Button>
  );
};
