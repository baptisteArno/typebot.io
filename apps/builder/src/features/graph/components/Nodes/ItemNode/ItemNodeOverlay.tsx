import { Flex, FlexProps } from '@chakra-ui/react'
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
      bgColor="white"
      borderWidth="1px"
      borderColor={'gray.300'}
      w="212px"
      pointerEvents="none"
      shadow="lg"
      {...props}
    >
      {(item.content ?? 'Click to edit') as ReactNode}
    </Flex>
  )
}
