import {
  Checkbox,
  Flex,
  Skeleton,
  chakra,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

type LoadingRowsProps = {
  totalColumns: number;
};

export const LoadingRows = ({ totalColumns }: LoadingRowsProps) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  return (
    <>
      {Array.from(Array(3)).map((_, idx) => (
        <tr key={idx}>
          <chakra.td
            px="2"
            py="2"
            border="1px"
            borderColor={borderColor}
            width="40px"
          >
            <Flex ml="1">
              <Checkbox isDisabled />
            </Flex>
          </chakra.td>
          {Array.from(Array(totalColumns)).map((_, idx) => {
            return (
              <chakra.td
                key={idx}
                px="4"
                py="2"
                border="1px"
                borderColor={borderColor}
              >
                <Skeleton height="5px" w="full" />
              </chakra.td>
            );
          })}
        </tr>
      ))}
    </>
  );
};
