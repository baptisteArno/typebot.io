import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import type { TypebotInDashboard } from "@/features/dashboard/types";
import {
  Box,
  type BoxProps,
  Flex,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { LayoutBottomIcon } from "@typebot.io/ui/icons/LayoutBottomIcon";

type Props = {
  typebot: TypebotInDashboard;
} & BoxProps;

export const TypebotCardOverlay = ({ typebot, ...props }: Props) => {
  return (
    <Box
      display="flex"
      flexDir="column"
      variant="outline"
      justifyContent="center"
      w="225px"
      h="270px"
      whiteSpace="normal"
      transition="none"
      pointerEvents="none"
      borderWidth={1}
      rounded="md"
      bgColor={useColorModeValue("white", "gray.700")}
      shadow="md"
      opacity={0.7}
      {...props}
    >
      <VStack spacing={4}>
        <Flex
          rounded="full"
          justifyContent="center"
          alignItems="center"
          fontSize={"4xl"}
        >
          <EmojiOrImageIcon
            icon={typebot.icon}
            size="lg"
            defaultIcon={LayoutBottomIcon}
          />
        </Flex>
        <p className="font-medium">{typebot.name}</p>
      </VStack>
    </Box>
  );
};
