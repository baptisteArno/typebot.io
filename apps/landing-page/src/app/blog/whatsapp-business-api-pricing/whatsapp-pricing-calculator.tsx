"use client";

import {
  Box,
  Flex,
  Heading,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import type React from "react";
import { useEffect, useState } from "react";
import pricingData from "./whatsapp-business-api-pricing-data.json";

const WhatsAppPricingCalculator: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [messageCount, setMessageCount] = useState(1);
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (selectedCountry && selectedType) {
      const countryData = pricingData.markets.find(
        (market) => market.market === selectedCountry,
      );
      if (countryData) {
        const typePrice =
          countryData[selectedType.toLowerCase() as keyof typeof countryData];
        if (typeof typePrice === "number") {
          setPrice(typePrice * messageCount);
        } else {
          setPrice(null);
        }
      }
    }
  }, [selectedCountry, selectedType, messageCount]);

  return (
    <Box bg="gray.800" p={6} borderRadius="lg" shadow="xl">
      <VStack spacing={6} align="stretch">
        <Box>
          <Text mb={2} fontWeight="medium">
            Select Country:
          </Text>
          <Select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            placeholder="Select a type"
          >
            <option value="Marketing">Marketing</option>
            <option value="Utility">Utility</option>
            <option value="Authentication">Authentication</option>
            <option value="Service">Service</option>
          </Select>
        </Box>
        <Box>
          <Text mb={2} fontWeight="medium">
            Number of Messages (optional):
          </Text>
          <NumberInput
            value={messageCount}
            onChange={(_, value) => setMessageCount(Math.max(1, value))}
            min={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </Box>
        {price !== null && (
          <Flex justify="space-between" align="center" mt={4}>
            <Text fontWeight="bold">Estimated Price:</Text>
            <Text fontSize="xl" fontWeight="bold" color="blue.300">
              ${price.toFixed(4)} USD
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default WhatsAppPricingCalculator;
