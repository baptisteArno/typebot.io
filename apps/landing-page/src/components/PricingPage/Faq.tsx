import { Heading, Stack, Text, VStack, Wrap, WrapItem } from "@chakra-ui/react";

export const Faq = () => (
  <VStack w="full" spacing="10">
    <Heading textAlign="center">Frequently asked questions</Heading>
    <Wrap spacing={10}>
      <WrapItem maxW="500px">
        <Stack borderWidth={1} p="8" rounded="lg" spacing={4}>
          <Heading as="h2" fontSize="2xl">
            What is considered a monthly chat?
          </Heading>
          <Text>
            A chat is counted whenever a user starts a discussion. It is
            independant of the number of messages he sends and receives. For
            example if a user starts a discussion and sends 10 messages to the
            bot, it will count as 1 chat. If the user chats again later and its
            session is remembered, it will not be counted as a new chat. <br />
            <br />
            An easy way to think about it: 1 chat equals to a row in your
            Results table
          </Text>
        </Stack>
      </WrapItem>

      <WrapItem maxW="500px">
        <Stack borderWidth={1} p="8" rounded="lg" spacing={4}>
          <Heading as="h2" fontSize="2xl">
            What happens once I reach the included chats limit?
          </Heading>
          <Text>
            That&apos;s amazing, your bots are working full speed. 🚀
            <br />
            <br />
            You will first receive a heads up email when you reach 80% of your
            included limit. Once you have reached 100%, you will receive another
            email notification.
            <br />
            <br />
            After that, your chat limit be automatically upgraded to the next
            tier.
          </Text>
        </Stack>
      </WrapItem>

      <WrapItem maxW="500px">
        <Stack borderWidth={1} p="8" rounded="lg" spacing={4}>
          <Heading as="h2" fontSize="2xl">
            Can I cancel or change my subscription any time?
          </Heading>
          <Text>
            Yes, you can cancel, upgrade or downgrade your subscription at any
            time. There is no minimum time commitment or lock-in.
            <br />
            <br />
            When you upgrade or downgrade your subscription, you&apos;ll get
            access to the new options right away. Your next invoice will have a
            prorated amount.
          </Text>
        </Stack>
      </WrapItem>
      <WrapItem maxW="500px">
        <Stack borderWidth={1} p="8" rounded="lg" spacing={4}>
          <Heading as="h2" fontSize="2xl">
            Do you offer annual payments?
          </Heading>
          <Text>
            No, because subscriptions pricing is based on chats usage, we can
            only offer monthly plans.
          </Text>
        </Stack>
      </WrapItem>
    </Wrap>
  </VStack>
);
