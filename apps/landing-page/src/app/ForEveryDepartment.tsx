"use client";

import {
  Box,
  Card,
  Heading,
  IconButton,
  Span,
  Stack,
  Text,
  Theme,
  VStack,
} from "@chakra-ui/react";
import { isDefined } from "@typebot.io/lib/utils";
import { CloseIcon } from "@typebot.io/ui/icons/CloseIcon";
import { PlusIcon } from "@typebot.io/ui/icons/PlusIcon";
import { motion } from "framer-motion";
import Image from "next/image";
import marketingSrc from "public/images/marketing.png";
import productSrc from "public/images/product.png";
import salesSrc from "public/images/sales.png";
import { useRef, useState } from "react";
import { useClickAway } from "react-use";
import type { DepartmentCardData } from "./types";

const departments = [
  {
    title: "Marketing",
    sub: "Let your bot drive the conversation and turn leads into customers.",
    bulletPoints: [
      {
        main: "Lead scoring",
        sub: "Typebot asks questions while automatically scoring and prioritizing new leads.",
      },
      {
        main: "Insights",
        sub: "Engaging quizzes will help you collect visitor emails and provide valuable insights on their needs.",
      },
      {
        main: "Lead magnet",
        sub: "Provide access to valuable content in return for email addresses.",
      },
    ],
    image: {
      src: marketingSrc,
      alt: "marketing illustration",
      gradientPlacement: "right",
    },
  },
  {
    title: "Support & Product",
    sub: "Deliver 24/7 multichannel support and make your customers happy.",
    bulletPoints: [
      {
        main: "Customer support",
        sub: "Qualify user requests and redirect them to the right resources.",
      },
      {
        main: "NPS Survey",
        sub: "Easily collect user feedback on your product.",
      },
      {
        main: "Customer onboarding",
        sub: "Your bot starts engaging immediately after registration to qualify new customers.",
      },
    ],
    image: {
      src: productSrc,
      alt: "Product illustration",
      gradientPlacement: "left",
    },
  },
  {
    title: "Sales",
    sub: "Boost meetings and show rates with highly interested leads",
    bulletPoints: [
      {
        main: "Prospect qualification",
        sub: "Your bot scores leads based on your sales criteria and addresses FAQs 24/7.",
      },
      {
        main: "Meetings",
        sub: "Automate appointment scheduling to simplify the process for customers.",
      },
      {
        main: "Lead nurturing",
        sub: "Send instant follow-ups and other communications to keep leads engaged until they’re ready to purchase.",
      },
    ],
    image: {
      src: salesSrc,
      alt: "sales illustration",
      gradientPlacement: "left",
    },
  },
] as const satisfies DepartmentCardData[];

export const ForEveryDepartment = () => {
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [openedDepartmentIndex, setOpenedDepartmentIndex] = useState<number>();

  const openedDepartment = isDefined(openedDepartmentIndex)
    ? departments[openedDepartmentIndex]
    : undefined;

  useClickAway(dialogContentRef, () => {
    setTimeout(() => {
      setOpenedDepartmentIndex(undefined);
    }, 100);
  });

  return (
    <Theme appearance="dark">
      <VStack w="full" py="16" px="4" gap="12">
        <Stack>
          <Heading textAlign="center" textStyle="4xl">
            Designed for every department
          </Heading>
          <Text color="gray.400" fontWeight={400} textAlign="center">
            Automate conversations throughout the entire customer journey.
          </Text>
        </Stack>
        {departments.map((department, index) => (
          <Card.Root
            asChild
            key={department.title}
            color="white"
            bgColor="#1A1A1A"
            borderColor="gray.800"
            onClick={() => {
              if (openedDepartment) return;
              setOpenedDepartmentIndex(index);
            }}
            rounded="2xl"
          >
            <motion.div layoutId={`dep-${index}`}>
              <Card.Body p="2">
                <Stack gap={4}>
                  <motion.figure layoutId={`dep-${index}-img`}>
                    <Image
                      src={department.image.src}
                      alt={department.image.alt}
                    />
                  </motion.figure>
                  <Stack px="2" pb="4" gap="3">
                    <Heading textStyle="3xl" fontWeight="medium" asChild>
                      <motion.h2 layoutId={`dep-${index}-heading`}>
                        {department.title}
                      </motion.h2>
                    </Heading>
                    <Text asChild pr="10">
                      <motion.p layoutId={`dep-${index}-desc`}>
                        {department.sub}
                      </motion.p>
                    </Text>
                  </Stack>
                </Stack>
                <IconButton
                  rounded="full"
                  variant="outline"
                  pos="absolute"
                  bottom="1rem"
                  right="1rem"
                  minW="24px"
                  boxSize="24px"
                >
                  <PlusIcon />
                </IconButton>
              </Card.Body>
            </motion.div>
          </Card.Root>
        ))}
      </VStack>
      {openedDepartment && (
        <Box
          pos="fixed"
          boxSize="full"
          inset="0"
          bgColor="blackAlpha.800"
          zIndex="1"
        >
          <Box pos="absolute" top="5%">
            <Card.Root
              ref={dialogContentRef}
              color="white"
              bgColor="#1A1A1A"
              borderColor="gray.800"
              borderWidth={1}
              mx="4"
              rounded="2xl"
            >
              <motion.div layoutId={`dep-${openedDepartmentIndex}`}>
                {openedDepartment && (
                  <Card.Body p="2">
                    <Stack gap={4}>
                      <motion.figure
                        layoutId={`dep-${openedDepartmentIndex}-img`}
                      >
                        <IconButton
                          pos="absolute"
                          top="1rem"
                          right={
                            openedDepartment.image.gradientPlacement === "right"
                              ? "1rem"
                              : undefined
                          }
                          left={
                            openedDepartment.image.gradientPlacement === "left"
                              ? "1rem"
                              : undefined
                          }
                          color="white"
                          bgColor="gray.950"
                          opacity={0}
                          animation="slide-fade-in 200ms ease-out"
                          animationDelay="0.5s"
                          animationFillMode="forwards"
                          onClick={() => setOpenedDepartmentIndex(undefined)}
                        >
                          <CloseIcon />
                        </IconButton>
                        <Image
                          src={openedDepartment.image.src}
                          alt={openedDepartment.image.alt}
                        />
                      </motion.figure>
                      <Stack gap="8" pb="4" px="2">
                        <Stack gap="3">
                          <Heading textStyle="3xl" fontWeight="medium" asChild>
                            <motion.h2
                              layoutId={`dep-${openedDepartmentIndex}-heading`}
                            >
                              {openedDepartment.title}
                            </motion.h2>
                          </Heading>
                          <Text textStyle="md" asChild>
                            <motion.p
                              layoutId={`dep-${openedDepartmentIndex}-desc`}
                            >
                              {openedDepartment.sub}
                            </motion.p>
                          </Text>
                        </Stack>
                        <Stack
                          as="ul"
                          gap="4"
                          pl="4"
                          listStyleType="circle"
                          listStylePosition="inside"
                        >
                          {openedDepartment.bulletPoints.map(
                            (bulletPoint, index) => (
                              <Span as="li" textStyle="md" key={index}>
                                <Span fontWeight="medium">
                                  {bulletPoint.main}:
                                </Span>{" "}
                                {bulletPoint.sub}
                              </Span>
                            ),
                          )}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card.Body>
                )}
              </motion.div>
            </Card.Root>
          </Box>
        </Box>
      )}
    </Theme>
  );
};
