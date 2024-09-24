import {
  CapterraIcon,
  EmailIcon,
  ProductHuntIcon,
  RedditIcon,
} from "@/assets/icons";
import { Avatar, Flex, HStack, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import * as React from "react";
import type { TestimonialData } from "./Testimonials";

export const Testimonial = ({
  avatarSrc,
  content,
  name,
  role,
  provider,
}: TestimonialData) => (
  <Stack
    p="6"
    rounded="lg"
    bgColor="gray.800"
    color="white"
    shadow="lg"
    spacing="4"
    data-aos="fade"
  >
    <Flex justifyContent="space-between">
      <HStack spacing="4">
        {avatarSrc ? (
          <Image
            src={avatarSrc}
            alt={name}
            placeholder="blur"
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <Avatar name={name} />
        )}
        <Stack spacing={1}>
          <Text
            as="cite"
            fontStyle="normal"
            fontWeight="extrabold"
            color="white"
          >
            {name}
          </Text>
          <Text fontSize="sm" color={"gray.100"}>
            {role}
          </Text>
        </Stack>
      </HStack>
      <ProviderIcon provider={provider} />
    </Flex>

    <Text mt="3" maxW="38rem" color="gray.400">
      {content}
    </Text>
  </Stack>
);

const ProviderIcon = ({
  provider,
}: {
  provider: TestimonialData["provider"];
}): JSX.Element => {
  switch (provider) {
    case "email":
      return <EmailIcon fontSize="20px" />;
    case "productHunt":
      return <ProductHuntIcon fontSize="20px" />;
    case "capterra":
      return <CapterraIcon fontSize="20px" />;
    case "reddit":
      return <RedditIcon fontSize="20px" />;
  }
};
