import { Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { ChevronLeftIcon } from "@/components/icons";
import { ButtonLink } from "./ButtonLink";

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
        <ButtonLink href="/typebots">
          <ChevronLeftIcon />
          Dashboard
        </ButtonLink>
      </VStack>
    </Flex>
  );
};
