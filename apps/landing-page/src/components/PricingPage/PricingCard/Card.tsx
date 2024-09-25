import { Box, type BoxProps, useColorModeValue } from "@chakra-ui/react";
import * as React from "react";
import { CardBadge } from "./CardBadge";

export interface CardProps extends BoxProps {
  isPopular?: boolean;
}

export const Card = (props: CardProps) => {
  const { children, isPopular, ...rest } = props;
  return (
    <Box
      bg={useColorModeValue("white", "gray.700")}
      position="relative"
      px="6"
      py="6"
      overflow="hidden"
      shadow="lg"
      maxW="md"
      width="100%"
      {...rest}
    >
      {isPopular && <CardBadge>Popular</CardBadge>}
      {children}
    </Box>
  );
};
