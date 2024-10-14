"use client";
import { Link } from "@chakra-ui/next-js";
import { Heading, Stack, Text } from "@chakra-ui/react";
import { isDefined } from "@typebot.io/lib/utils";
import type { BlogPost } from "../types";

type Props = {
  posts: BlogPost[];
};

export const Posts = ({ posts }: Props) => (
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
      {posts
        .filter((post) => isDefined(post.postedAt))
        .sort((a, b) => {
          if (new Date(a.postedAt!) > new Date(b.postedAt!)) {
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
                {post.title}
              </Heading>
              <Text color="gray.500">
                {new Date(post.postedAt!).toDateString()}
              </Text>
            </Stack>
          </Link>
        ))}
    </Stack>
  </Stack>
);
