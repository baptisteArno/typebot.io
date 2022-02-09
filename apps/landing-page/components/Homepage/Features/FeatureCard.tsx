import { Flex, VStack } from '@chakra-ui/layout'
import { IconProps, Text } from '@chakra-ui/react'
import React from 'react'

type FeatureCardProps = {
  Icon: (props: IconProps) => JSX.Element
  title: string
  content: string
}

export const FeatureCard = ({ Icon, title, content }: FeatureCardProps) => {
  return (
    <VStack p="6" bgColor="gray.100" pos="relative" rounded="lg" spacing="4">
      <Flex
        boxSize="50px"
        bgColor="blue.500"
        rounded="lg"
        color="white"
        justify="center"
        align="center"
        pos="absolute"
        top="-25px"
        shadow="lg"
      >
        <Icon boxSize="25px" />
      </Flex>
      <Text textAlign="center" fontWeight="semibold">
        {title}
      </Text>
      <Text textAlign="center" color="gray.500">
        {content}
      </Text>
    </VStack>
  )
}
