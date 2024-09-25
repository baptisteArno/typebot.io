import { CreditCardIcon } from "@/components/icons";
import type { IconProps } from "@chakra-ui/react";
import React from "react";

export const PaymentInputIcon = (props: IconProps) => (
  <CreditCardIcon color="orange.500" {...props} />
);
