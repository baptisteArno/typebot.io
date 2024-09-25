"use client";
import { Link } from "@chakra-ui/next-js";
import { Heading, Stack, Text } from "@chakra-ui/react";

type Props = {
  allBlogs: {
    metadata: {
      title: string;
      publishedAt: string;
    };
    slug: string;
  }[];
};

export const Posts = ({ allBlogs }: Props) => (
  <Stack
    spacing={10}
    mx="auto"
    maxW="3xl"
    my="20"
    fontSize="17px"
    textAlign="justify"
  >
    <Heading>Latest blog posts:</Heading>
    <Stack>
      {allBlogs
        .filter((post) => post.metadata.publishedAt)
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <Stack
              w="full"
              rounded="md"
              borderColor="gray.600"
              borderWidth={1}
              p="4"
            >
              <Heading as="h2" fontSize="2xl">
                {post.metadata.title}
              </Heading>
              <Text color="gray.500">
                {new Date(post.metadata.publishedAt).toDateString()}
              </Text>
            </Stack>
          </Link>
        ))}
    </Stack>
  </Stack>
);
