import { BackgroundPolygons } from "@/components/Homepage/Hero/BackgroundPolygons";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header/Header";
import { SocialMetaTags } from "@/components/common/SocialMetaTags";
import {
  Button,
  DarkMode,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { GetStaticPropsResult } from "next";
import Link from "next/link";

type OSSFriend = {
  href: string;
  name: string;
  description: string;
};

type Props = {
  ossFriends: OSSFriend[];
};

export default function OSSFriendsPage({ ossFriends }: Props) {
  return (
    <Stack overflowX="hidden" bgColor="gray.900">
      <Flex
        pos="relative"
        flexDir="column"
        minHeight="100vh"
        alignItems="center"
        bgGradient="linear(to-b, gray.900, gray.800)"
        pb={40}
      >
        <SocialMetaTags currentUrl={`https://www.typebot.io/oss-friends`} />
        <BackgroundPolygons />
        <DarkMode>
          <Header />
        </DarkMode>
        <VStack spacing={12}>
          <Stack pt="20" px="2" spacing="4">
            <Heading fontSize={{ base: "4xl", xl: "6xl" }} textAlign="center">
              Our{" "}
              <Text as="span" color="blue.200" fontWeight="bold">
                Open-source
              </Text>{" "}
              Friends
            </Heading>
            <Text
              maxW="900px"
              textAlign="center"
              fontSize={{ base: "lg", xl: "xl" }}
            >
              We love open-source and we are proud to support these amazing
              projects. 💙
            </Text>
          </Stack>

          <SimpleGrid columns={[1, 2, 3]} spacing="6" maxW="1200px">
            {ossFriends
              .filter((friend) => friend.name !== "Typebot")
              .map((friend, index) => (
                <Stack
                  key={index}
                  p="6"
                  rounded="lg"
                  bgColor="gray.800"
                  color="white"
                  shadow="lg"
                  spacing="4"
                  data-aos="fade"
                  justifyContent="space-between"
                >
                  <Stack spacing={4}>
                    <Heading fontSize="2xl">{friend.name}</Heading>
                    <Text>{friend.description}</Text>
                  </Stack>

                  <Flex>
                    <Button
                      as={Link}
                      target="_blank"
                      href={friend.href}
                      variant="outline"
                    >
                      Learn more
                    </Button>
                  </Flex>
                </Stack>
              ))}
          </SimpleGrid>
        </VStack>
      </Flex>
      <Footer />
    </Stack>
  );
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const res = await fetch("https://formbricks.com/api/oss-friends");
  const data = await res.json();

  return {
    props: {
      ossFriends: data.data,
    },
  };
}
