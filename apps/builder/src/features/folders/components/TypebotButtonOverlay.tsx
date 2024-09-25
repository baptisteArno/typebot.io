import { EmojiOrImageIcon } from "@/components/EmojiOrImageIcon";
import type { TypebotInDashboard } from "@/features/dashboard/types";
import {
  Box,
  type BoxProps,
  Flex,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

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
      shadow="lg"
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
          <EmojiOrImageIcon icon={typebot.icon} boxSize={"35px"} />
        </Flex>
        <Text>{typebot.name}</Text>
      </VStack>
    </Box>
  );
};
