import { IconProps, Text, Flex, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'

type FeatureCardProps = {
  Icon: (props: IconProps) => JSX.Element
  title: string
  content: string
}

export const FeatureCard = ({ Icon, title, content }: FeatureCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <VStack
      p="6"
      bgColor="gray.800"
      pos="relative"
      rounded="lg"
      spacing="4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
        transform={isHovered ? 'translateY(-5px)' : 'translateY(0px)'}
        transition="transform 300ms ease-out"
      >
        <Icon boxSize="25px" />
      </Flex>
      <Text textAlign="center" fontWeight="semibold" fontSize="lg">
        {title}
      </Text>
      <Text textAlign="center" color="gray.500">
        {content}
      </Text>
    </VStack>
  )
}
