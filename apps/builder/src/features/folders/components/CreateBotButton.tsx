import { Text, VStack } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Button, type ButtonProps } from "@typebot.io/ui/components/Button";
import { cn } from "@typebot.io/ui/lib/cn";
import { useRouter } from "next/router";
import { stringify } from "qs";
import { PlusIcon } from "@/components/icons";
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
      onClick={handleClick}
      className={cn(
        "px-6 whitespace-normal w-[225px] h-[270px] [&_svg]:size-10",
        draggedTypebot && "opacity-30",
      )}
      {...props}
    >
      <VStack spacing="6">
        <PlusIcon />
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
