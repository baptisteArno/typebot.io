import { HelpCircleIcon } from "@/assets/icons/HelpCircleIcon";
import { Button, HStack, Stack, Text, Tooltip, chakra } from "@chakra-ui/react";
import { prices, seatsLimits } from "@typebot.io/billing/constants";
import { Plan } from "@typebot.io/prisma/enum";
import Link from "next/link";
import React from "react";
import { PricingCard } from "./PricingCard";

export const StarterPlanCard = () => {
  return (
    <PricingCard
      data={{
        price: prices.STARTER,
        name: "Starter",
        featureLabel: "Everything in Personal, plus:",
        features: [
          <Text key="seats">
            <chakra.span fontWeight="bold">
              {seatsLimits.STARTER} seats
            </chakra.span>{" "}
            included
          </Text>,
          <Stack key="chats" spacing={0}>
            <HStack spacing={1.5}>
              <Text>2,000 chats/mo</Text>
              <Tooltip
                hasArrow
                placement="top"
                label="A chat is counted whenever a user starts a discussion. It is
    independant of the number of messages he sends and receives."
              >
                <chakra.span cursor="pointer" h="7">
                  <HelpCircleIcon />
                </chakra.span>
              </Tooltip>
            </HStack>
            <Text fontSize="sm" color="gray.400">
              Extra chats: $10 per 500
            </Text>
          </Stack>,
          "Branding removed",
          "Collect files from users",
          "Create folders",
          "Direct priority support",
        ],
      }}
      borderWidth="1px"
      borderColor="orange.200"
      button={
        <Button
          as={Link}
          href={`https://app.typebot.io/register?subscribePlan=${Plan.STARTER}`}
          colorScheme="orange"
          size="lg"
          w="full"
          fontWeight="extrabold"
          py={{ md: "8" }}
          variant="outline"
        >
          Subscribe now
        </Button>
      }
    />
  );
};
