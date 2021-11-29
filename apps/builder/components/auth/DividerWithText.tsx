import { FlexProps, Flex, Box, Divider, Text } from '@chakra-ui/react'
import { useColorModeValue } from '@chakra-ui/system'
import React from 'react'

export const DividerWithText = (props: FlexProps) => {
  const { children, ...flexProps } = props
  return (
    <Flex align="center" color="gray.300" {...flexProps}>
      <Box flex="1">
        <Divider borderColor="currentcolor" />
      </Box>
      <Text
        as="span"
        px="3"
        color={useColorModeValue('gray.600', 'gray.400')}
        fontWeight="medium"
      >
        {children}
      </Text>
      <Box flex="1">
        <Divider borderColor="currentcolor" />
      </Box>
    </Flex>
  )
}
