import { Stack, Text, VStack } from "@chakra-ui/react";
import { CtaButton } from "@typebot.io/ui/components/button";
import { HeroHeading } from "./HeroHeading";

export const Hero = () => (
  <Stack as="main" justifyContent="center" px="4" pt="36" pb="20" gap={0}>
    <VStack px="2" gap={10}>
      <HeroHeading />
      <Text
        textAlign="center"
        color="gray.400"
        fontWeight={400}
        opacity={0}
        animation="slide-fade-in 200ms ease-out"
        animationDelay="1.7s"
        animationFillMode="forwards"
      >
        With Typebot, chatbot becomes a resource where the possibilities to chat
        are wide and conversion high. Scroll to see why!
      </Text>

      <CtaButton
        opacity={0}
        animation="slide-fade-in 200ms ease-out"
        animationDelay="1.8s"
        animationFillMode="forwards"
      >
        Start building
      </CtaButton>
    </VStack>
  </Stack>
);
