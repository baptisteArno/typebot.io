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
import { CheckCircleIcon } from '../../../assets/icons/CheckCircleIcon'
import { Card, CardProps } from './Card'

export interface PricingCardData {
  features: string[]
  name: string
  price: string
  featureLabel?: string
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
      <Flex justifyContent="space-between" flexDir="column" h="full">
        <Flex flexDir="column">
          <VStack spacing={6}>
            {icon}
            <Heading size="md" fontWeight="extrabold" color={rest.borderColor}>
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
                / month
              </Text>
            )}
          </Flex>

          <List spacing="4" mb="8" maxW="30ch" mx="auto">
            {data.featureLabel && (
              <Text fontWeight="bold">{data.featureLabel}</Text>
            )}
            {features.map((feature, index) => (
              <ListItem fontWeight="medium" key={index}>
                <ListIcon
                  fontSize="xl"
                  as={CheckCircleIcon}
                  marginEnd={2}
                  color={accentColor}
                  fill={rest.borderColor}
                />
                {feature}
              </ListItem>
            ))}
          </List>
        </Flex>

        {button}
      </Flex>
    </Card>
  )
}
