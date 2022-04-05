import {
  Flex,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { CheckIcon } from 'assets/icons'
import * as React from 'react'
import { Card, CardProps } from './Card'

export interface PricingCardData {
  features: string[]
  name: string
  price: string
}

interface PricingCardProps extends CardProps {
  data: PricingCardData
  button: React.ReactElement
}

export const PricingCard = (props: PricingCardProps) => {
  const { data, button, ...rest } = props
  const { features, price, name } = data
  const accentColor = useColorModeValue('blue.500', 'blue.200')

  return (
    <Card rounded={{ sm: 'xl' }} {...rest}>
      <VStack spacing={6}>
        <Heading size="md" fontWeight="extrabold">
          {name}
        </Heading>
      </VStack>
      <Flex
        align="flex-end"
        justify="center"
        fontWeight="extrabold"
        color={accentColor}
        my="8"
      >
        <Heading size="3xl" fontWeight="inherit" lineHeight="0.9em">
          {price}
        </Heading>
        <Text fontWeight="inherit" fontSize="2xl">
          / mo
        </Text>
      </Flex>
      <List spacing="4" mb="8" maxW="30ch" mx="auto">
        {features.map((feature, index) => (
          <ListItem fontWeight="medium" key={index}>
            <ListIcon
              fontSize="xl"
              as={CheckIcon}
              marginEnd={2}
              color={accentColor}
            />
            {feature}
          </ListItem>
        ))}
      </List>
      {button}
    </Card>
  )
}
