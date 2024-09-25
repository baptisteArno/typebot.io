import { HelpCircleIcon } from "@/assets/icons/HelpCircleIcon";
import {
  Button,
  HStack,
  Link,
  Stack,
  Text,
  Tooltip,
  chakra,
} from "@chakra-ui/react";
import { prices, seatsLimits } from "@typebot.io/billing/constants";
import { Plan } from "@typebot.io/prisma/enum";
import React from "react";
import { PricingCard } from "./PricingCard";

type Props = {
  onChatsTiersClick: () => void;
};

export const ProPlanCard = ({ onChatsTiersClick }: Props) => (
  <PricingCard
    data={{
      price: prices.PRO,
      name: "Pro",
      featureLabel: "Everything in Personal, plus:",
      features: [
        <Text key="seats">
          <chakra.span fontWeight="bold">{seatsLimits.PRO} seats</chakra.span>{" "}
          included
        </Text>,
        <Stack key="chats" spacing={0}>
          <HStack spacing={1.5}>
            <Text>10,000 chats/mo</Text>
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
            Extra chats:{" "}
            <Button
              variant="outline"
              size="xs"
              colorScheme="gray"
              onClick={onChatsTiersClick}
            >
              See tiers
            </Button>
          </Text>
        </Stack>,
        "WhatsApp integration",
        "Custom domains",
        "In-depth analytics",
      ],
    }}
    borderWidth="3px"
    borderColor="blue.200"
    button={
      <Button
        as={Link}
        href={`https://app.typebot.io/register?subscribePlan=${Plan.PRO}`}
        colorScheme="blue"
        size="lg"
        w="full"
        fontWeight="extrabold"
        py={{ md: "8" }}
      >
        Subscribe now
      </Button>
    }
  />
);
