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
import * as React from 'react'
import { CheckIcon } from '../../../assets/icons/CheckIcon'
import { Card, CardProps } from './Card'

export interface PricingCardData {
  features: string[]
  name: string
  price: string
}

interface PricingCardProps extends CardProps {
  data: PricingCardData
  icon?: JSX.Element
  button: React.ReactElement
}

export const PricingCard = (props: PricingCardProps) => {
  const { data, icon, button, ...rest } = props
  const { features, price, name } = data
  const accentColor = useColorModeValue('blue.500', 'white')

  return (
    <Card rounded="xl" bgColor="gray.800" {...rest}>
      <VStack spacing={6}>
        {icon}
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
        <Heading size="2xl" fontWeight="inherit" lineHeight="0.9em">
          {price}
        </Heading>
        {(price.includes('$') || price.includes('€')) && (
          <Text fontWeight="inherit" fontSize="xl">
            / mo
          </Text>
        )}
      </Flex>
      <List spacing="4" mb="8" maxW="30ch" mx="auto">
        {features.map((feature, index) => (
          <ListItem fontWeight="medium" key={index}>
            <ListIcon
              fontSize="xl"
              as={CheckIcon}
              marginEnd={2}
              color={accentColor}
              fill="blue.200"
            />
            {feature}
          </ListItem>
        ))}
      </List>
      {button}
    </Card>
  )
}
