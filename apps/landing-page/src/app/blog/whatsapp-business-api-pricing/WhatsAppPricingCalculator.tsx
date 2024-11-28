"use client";

import {
  Box,
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import { isNotDefined } from "@typebot.io/lib/utils";
import type React from "react";
import { type ChangeEvent, useState } from "react";
import { pricingData } from "./pricingData";

const messageTypes = [
  "Marketing",
  "Utility",
  "Authentication",
  "Service",
] as const;

export const WhatsAppPricingCalculator = () => {
  const [selectedCountry, setSelectedCountry] =
    useState<(typeof pricingData)["markets"][number]["market"]>();
  const [selectedMessageType, setSelectedMessageType] =
    useState<(typeof messageTypes)[number]>();
  const [messageCount, setMessageCount] = useState(1);
  const [price, setPrice] = useState<number>();

  const updatePrice = () => {
    if (isNotDefined(selectedCountry) || isNotDefined(selectedMessageType))
      return;

    const countryData = pricingData.markets.find(
      (market) => market.market === selectedCountry,
    );
    if (!countryData) return;

    const typePrice =
      countryData[
        selectedMessageType.toLowerCase() as keyof typeof countryData
      ];
    setPrice(
      typeof typePrice === "number" ? typePrice * messageCount : undefined,
    );
  };

  const updateCountry = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(
      event.target.value as (typeof pricingData)["markets"][number]["market"],
    );
    updatePrice();
  };

  const updateMessageType = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedMessageType(event.target.value as (typeof messageTypes)[number]);
    updatePrice();
  };

  const updateMessageCount = (_: string, value: number) => {
    setMessageCount(Math.max(1, value));
    updatePrice();
  };

  return (
    <Box bg="gray.800" p={6} borderRadius="lg" shadow="xl">
      <VStack spacing={6} align="stretch">
        <Box>
          <Text mb={2} fontWeight="medium">
            Select Country:
          </Text>
          <Select
            value={selectedCountry}
            onChange={updateCountry}
            placeholder="Select a country"
          >
            {pricingData.markets.map((market) => (
              <option key={market.market} value={market.market}>
                {market.market}
              </option>
            ))}
          </Select>
        </Box>
        <Box>
          <Text mb={2} fontWeight="medium">
            Select Message Type:
          </Text>
          <Select
            value={selectedMessageType}
            onChange={updateMessageType}
            placeholder="Select a type"
          >
            {messageTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Box>
        <Box>
          <Text mb={2} fontWeight="medium">
            Number of Messages (optional):
          </Text>
          <NumberInput
            value={messageCount}
            onChange={updateMessageCount}
            min={1}
            step={100}
            clampValueOnBlur={true}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>
        {price && (
          <Flex justify="space-between" align="center" mt={4}>
            <Text fontWeight="bold">Estimated Price:</Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.300">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              }).format(price)}
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};
