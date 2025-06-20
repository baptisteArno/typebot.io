import { ChevronLeftIcon } from "@/components/icons";
import { Button, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react";

type Props = {
  resourceName: string;
};
export const NotFoundPage = ({ resourceName }: Props) => {
  return (
    <Flex justify="center" align="center" w="full" h="100vh">
      <VStack spacing={6}>
        <VStack>
          <Heading>404</Heading>
          <Text fontSize="xl">{resourceName} not found.</Text>
        </VStack>
        <Button
          as={Link}
          href="/typebots"
          colorScheme="orange"
          leftIcon={<ChevronLeftIcon />}
        >
          Dashboard
        </Button>
      </VStack>
    </Flex>
  );
};
