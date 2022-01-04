import { Checkbox, Flex, Skeleton } from '@chakra-ui/react'
import React from 'react'

type LoadingRowsProps = {
  totalColumns: number
}

export const LoadingRows = ({ totalColumns }: LoadingRowsProps) => {
  return (
    <>
      {Array.from(Array(3)).map((row, idx) => (
        <Flex as="tr" key={idx}>
          <Flex
            key={idx}
            py={2}
            px={4}
            border="1px"
            as="td"
            borderColor="gray.200"
            width="50px"
          >
            <Checkbox isDisabled />
          </Flex>
          {Array.from(Array(totalColumns)).map((cell, idx) => {
            return (
              <Flex
                key={idx}
                py={2}
                px={4}
                border="1px"
                as="td"
                borderColor="gray.200"
                width="180px"
                align="center"
              >
                <Skeleton height="5px" w="full" />
              </Flex>
            )
          })}
        </Flex>
      ))}
    </>
  )
}
