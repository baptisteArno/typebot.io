import { Heading, Stack, Text } from "@chakra-ui/react";
import type { PropsWithChildren } from "react";
import type { BlogPostModel } from "../types";
import "@/assets/prose.css";

export type PostViewProps = PropsWithChildren<{
  post: BlogPostModel;
}>;

export default function Post(props: PostViewProps) {
  return (
    <Stack spacing={10} my="20" w="full">
      <Stack
        mx="auto"
        spacing={0}
        as="article"
        px={3}
        w="full"
        className="prose prose-quoteless prose-neutral prose-invert max-w-none"
      >
        <Stack
          as="header"
          mx="auto"
          w="full"
          maxW={["full", "46rem"]}
          px={[3, 3, 0]}
        >
          <Heading as="h1" mb="0">
            {props.post.title}
          </Heading>
          <Text
            as="time"
            dateTime={props.post.postedAt?.toISOString()}
            color="gray.500"
          >
            {props.post.postedAt?.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            })}
          </Text>
        </Stack>
        {props.children}
      </Stack>
    </Stack>
  );
}
