import { CheckCircleIcon } from "@/assets/icons/CheckCircleIcon";
import { CloseIcon } from "@/assets/icons/CloseIcon";
import { Td, Text } from "@chakra-ui/react";
import React, { type ReactNode } from "react";

export const Yes = (props: { children?: ReactNode }) => (
  <Td display={props.children ? "flex" : ""}>
    <CheckCircleIcon fill="#0042da" width="25px" />
    {props.children && (
      <Text ml={1} fontSize="sm">
        {props.children}
      </Text>
    )}
  </Td>
);

export const No = (props: { children?: ReactNode }) => (
  <Td display={props.children ? "flex" : ""}>
    <CloseIcon width="25px" />
    {props.children && (
      <Text ml={1} fontSize="sm">
        {props.children}
      </Text>
    )}
  </Td>
);
