import { Heading, VStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'

export const Faq = () => (
  <VStack w="full" spacing="10">
    <Heading textAlign="center">Frequently asked questions</Heading>
    <SimpleGrid columns={[1, 2]} spacing={10}>
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
          An easy way to think about it: 1 chat equals to a row in your Results
          table
        </Text>
      </Stack>
      <Stack borderWidth={1} p="8" rounded="lg" spacing={4}>
        <Heading as="h2" fontSize="2xl">
          What happens once I reach the monthly chats limit?
        </Heading>
        <Text>
          When you exceed the number of chats included in your plan, you will
          receive a heads up by email. There won&apos;t be any immediate
          additional charges and your bots will continue to run. If you continue
          to exceed the limit, you will be kindly asked you to upgrade your
          subscription.
        </Text>
      </Stack>
      <Stack borderWidth={1} p="8" rounded="lg" spacing={4}>
        <Heading as="h2" fontSize="2xl">
          What is considered as storage?
        </Heading>
        <Text>
          You accumulate storage for every file that your user upload into your
          bot. If you delete the associated result, it will free up the used
          space.
        </Text>
      </Stack>
      <Stack borderWidth={1} p="8" rounded="lg" spacing={4}>
        <Heading as="h2" fontSize="2xl">
          What happens once I reach the storage limit?
        </Heading>
        <Text>
          When you exceed the storage size included in your plan, you will
          receive a heads up by email. There won&apos;t be any immediate
          additional charges and your bots will continue to store new files. If
          you continue to exceed the limit, you will be kindly asked you to
          upgrade your subscription.
        </Text>
      </Stack>
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
      <Stack borderWidth={1} p="8" rounded="lg" spacing={4}>
        <Heading as="h2" fontSize="2xl">
          Do you offer annual payments?
        </Heading>
        <Text>
          Yes. Starter and Pro plans can be purchased with monthly or annual
          billing.
          <br />
          <br />
          Annual plans are cheaper and give you a 16% discount compared to
          monthly payments. Enterprise plans are only available with annual
          billing.
        </Text>
      </Stack>
    </SimpleGrid>
  </VStack>
)
