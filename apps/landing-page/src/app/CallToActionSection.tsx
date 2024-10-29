import { Button, Span, Stack, Text } from "@chakra-ui/react";
import { CtaButton } from "@typebot.io/ui/components/button";

export const CallToActionSection = () => (
  <Stack gap={6}>
    <Text textAlign="center" color="gray.800">
      Picture{" "}
      <Span fontWeight="medium">
        a bot that goes beyond answering questions
      </Span>
      : it builds relationships, shares content, sparks conversations, and
      reflects your business's personality and values. With over 3 billion
      people on messaging apps,{" "}
      <Span fontWeight="medium">
        it's time to connect with your customers where they are
      </Span>
      .
    </Text>

    <Stack w="full" gap={4}>
      <CtaButton>Try it out</CtaButton>
      <Button
        color="white"
        size="lg"
        borderWidth={1}
        borderColor="gray.950"
        bgGradient="linear(to-b, #282828 0%, gray.950 57%)"
        _hover={{}}
        _active={{}}
        shadow="sm"
      >
        Book a demo
      </Button>
    </Stack>
  </Stack>
);
