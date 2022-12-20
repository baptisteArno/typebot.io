import { Flex, FlexProps, useColorModeValue } from '@chakra-ui/react'
import { Item } from 'models'
import React, { ReactNode } from 'react'

type Props = {
  item: Item
} & FlexProps

export const ItemNodeOverlay = ({ item, ...props }: Props) => {
  return (
    <Flex
      px="4"
      py="2"
      rounded="md"
      bgColor={useColorModeValue('white', 'gray.850')}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      w="212px"
      pointerEvents="none"
      shadow="lg"
      {...props}
    >
      {(item.content ?? 'Click to edit') as ReactNode}
    </Flex>
  )
}
