import { Flex, FlexProps } from '@chakra-ui/react'
import { ChoiceItem } from 'models'
import React from 'react'

type Props = {
  item: ChoiceItem
} & FlexProps

export const ButtonNodeOverlay = ({ item, ...props }: Props) => {
  return (
    <Flex
      px="4"
      py="2"
      rounded="md"
      bgColor="white"
      borderWidth="1px"
      borderColor={'gray.300'}
      w="212px"
      pointerEvents="none"
      shadow="lg"
      {...props}
    >
      {item.content ?? 'Click to edit'}
    </Flex>
  )
}
