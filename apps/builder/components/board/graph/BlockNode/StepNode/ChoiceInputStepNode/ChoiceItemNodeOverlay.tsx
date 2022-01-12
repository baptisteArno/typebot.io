import { Flex, FlexProps } from '@chakra-ui/react'
import { ChoiceItem } from 'models'
import React from 'react'

type ChoiceItemNodeOverlayProps = {
  item: ChoiceItem
} & FlexProps

export const ChoiceItemNodeOverlay = ({
  item,
  ...props
}: ChoiceItemNodeOverlayProps) => {
  return (
    <Flex
      px="4"
      py="2"
      rounded="md"
      bgColor="green.200"
      borderWidth="2px"
      borderColor={'gray.400'}
      w="212px"
      pointerEvents="none"
      {...props}
    >
      {item.content ?? 'Click to edit'}
    </Flex>
  )
}
