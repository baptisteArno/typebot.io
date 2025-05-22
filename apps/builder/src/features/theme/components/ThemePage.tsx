import { Seo } from "@/components/Seo";
import { TypebotHeader } from "@/features/editor/components/TypebotHeader";
import { TypebotNotFoundPage } from "@/features/editor/components/TypebotNotFoundPage";
import { headerHeight } from "@/features/editor/constants";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { Flex, HStack, useColorModeValue } from "@chakra-ui/react";
import { Standard } from "@typebot.io/react";
import { defaultBackgroundColor } from "@typebot.io/theme/constants";
import { ThemeSideMenu } from "./ThemeSideMenu";

export const ThemePage = () => {
  const { typebot, is404 } = useTypebot();

  if (is404) return <TypebotNotFoundPage />;
  return (
    <Flex overflow="hidden" h="100vh" flexDir="column">
      <Seo title={typebot?.name ? `${typebot.name} | Theme` : "Theme"} />
      <TypebotHeader />
      <HStack w="full" height={`calc(100vh - ${headerHeight}px)`} spacing={4}>
        <ThemeSideMenu />
        <Flex
          flex="1"
          bg={useColorModeValue("white", "gray.900")}
          height="calc(100% - 2rem)"
          w="full"
          borderWidth={1}
          rounded="xl"
          mr={4}
        >
          {typebot && (
            <Standard
              typebot={typebot}
              style={{
                borderRadius: "0.75rem",
                width: "100%",
                height: "100%",
                backgroundColor:
                  typebot.theme.general?.background?.content ??
                  defaultBackgroundColor[typebot.version],
              }}
            />
          )}
        </Flex>
      </HStack>
    </Flex>
  );
};
