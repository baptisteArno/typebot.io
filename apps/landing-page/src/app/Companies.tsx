import { Marquee } from "@/components/Marquee";
import { Box, Flex, Heading, Stack } from "@chakra-ui/react";
import {
  Awwwsome,
  IbanFirst,
  Lemlist,
  MakerLead,
  Obole,
  PinpointInteractive,
  SocialHackrs,
  Webisharp,
} from "./Brands";

export const Companies = () => (
  <Stack gap={6} w="full">
    <Heading textAlign="center" fontSize="4xl" fontWeight="medium">
      Trusted by 650+ companies worldwide
    </Heading>
    <Flex pos="relative" w="full">
      <Marquee>
        <IbanFirst width="100px" height="60px" />
        <Lemlist width="100px" height="60px" />
        <MakerLead width="100px" height="60px" />
        <Webisharp width="100px" height="60px" />
        <SocialHackrs width="100px" height="60px" />
        <PinpointInteractive width="100px" height="60px" />
        <Obole width="80px" height="60px" />
        <Awwwsome width="100px" height="60px" />
      </Marquee>
      <Box
        pos="absolute"
        pointerEvents="none"
        insetY={0}
        right={0}
        w="50px"
        bgGradient="to-r"
        gradientFrom="rgb(241 241 241 / 0.2)"
        gradientTo="gray.100"
      />
      <Box
        pos="absolute"
        pointerEvents="none"
        insetY={0}
        left={0}
        w="50px"
        bgGradient="to-l"
        gradientFrom="rgb(241 241 241 / 0.2)"
        gradientTo="gray.100"
      />
    </Flex>
  </Stack>
);
