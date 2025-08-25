import { ButtonLink } from "@/components/ButtonLink";
import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import { TypebotLogo } from "@/components/TypebotLogo";
import { CopyIcon, PlayIcon } from "@/components/icons";
import { useUser } from "@/features/user/hooks/useUser";
import { useRightPanel } from "@/hooks/useRightPanel";
import {
  Divider,
  Flex,
  HStack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { isNotDefined } from "@typebot.io/lib/utils";
import { Button } from "@typebot.io/ui/components/Button";
import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";
import { useRouter } from "next/router";
import React from "react";
import { headerHeight } from "../constants";
import { useEditor } from "../providers/EditorProvider";
import { useTypebot } from "../providers/TypebotProvider";

export const GuestTypebotHeader = () => {
  const { t } = useTranslate();
  const router = useRouter();
  const { user } = useUser();
  const { typebot, save } = useTypebot();
  const { setStartPreviewFrom } = useEditor();
  const [rightPanel, setRightPanel] = useRightPanel();

  const handlePreviewClick = async () => {
    setStartPreviewFrom(undefined);
    save().then();
    setRightPanel("preview");
  };

  return (
    <Flex
      w="full"
      borderBottomWidth="1px"
      justify="center"
      align="center"
      h={`${headerHeight}px`}
      zIndex={1}
      pos="relative"
      bgColor={useColorModeValue("white", "gray.950")}
      flexShrink={0}
    >
      <HStack
        display={["none", "flex"]}
        pos={{ base: "absolute", xl: "static" }}
        right={{ base: 280, xl: 0 }}
      >
        <ButtonLink
          href={`/typebots/${typebot?.id}/edit`}
          variant={router.pathname.includes("/edit") ? "outline" : "ghost"}
          size="sm"
        >
          {t("editor.header.flowButton.label")}
        </ButtonLink>
        <ButtonLink
          href={`/typebots/${typebot?.id}/theme`}
          variant={router.pathname.endsWith("theme") ? "outline" : "ghost"}
          size="sm"
        >
          {t("editor.header.themeButton.label")}
        </ButtonLink>
        <ButtonLink
          href={`/typebots/${typebot?.id}/settings`}
          variant={router.pathname.endsWith("settings") ? "outline" : "ghost"}
          size="sm"
        >
          {t("editor.header.settingsButton.label")}
        </ButtonLink>
      </HStack>
      <HStack
        pos="absolute"
        left="1rem"
        justify="center"
        align="center"
        spacing="6"
      >
        <HStack alignItems="center" spacing={3}>
          {typebot && (
            <EmojiOrImageIcon
              icon={typebot.icon}
              defaultIcon={LayoutBottomIcon}
            />
          )}
          <Text
            noOfLines={2}
            maxW="150px"
            overflow="hidden"
            fontSize="14px"
            minW="30px"
            minH="20px"
          >
            {typebot?.name}
          </Text>
        </HStack>
      </HStack>

      <HStack
        right="1rem"
        pos="absolute"
        display={["none", "flex"]}
        spacing={4}
      >
        <HStack>
          {typebot?.id && (
            <ButtonLink
              href={
                !user
                  ? {
                      pathname: `/register`,
                      query: {
                        redirectPath: `/typebots/${typebot.id}/duplicate`,
                      },
                    }
                  : `/typebots/${typebot.id}/duplicate`
              }
              variant="secondary"
              disabled={isNotDefined(typebot)}
              size="sm"
            >
              <CopyIcon />
              Duplicate
            </ButtonLink>
          )}
          {router.pathname.includes("/edit") && isNotDefined(rightPanel) && (
            <Button
              onClick={handlePreviewClick}
              disabled={isNotDefined(typebot)}
              size="sm"
            >
              <PlayIcon />
              Play bot
            </Button>
          )}
        </HStack>

        {!user && (
          <>
            <Divider orientation="vertical" h="25px" borderColor="gray.400" />
            <ButtonLink
              href={`/register`}
              variant="outline-secondary"
              size="sm"
            >
              <TypebotLogo />
              Try Typebot
            </ButtonLink>
          </>
        )}
      </HStack>
    </Flex>
  );
};
