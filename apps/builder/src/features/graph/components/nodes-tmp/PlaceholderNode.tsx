import { Flex, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

type Props = {
  isVisible: boolean
  isExpanded: boolean
  onRef: (ref: HTMLDivElement) => void
}

export const PlaceholderNode = ({ isVisible, isExpanded, onRef }: Props) => {
  return (
    <Flex
      ref={onRef}
      h={isExpanded ? '50px' : '2px'}
      bgColor={useColorModeValue('gray.300', 'gray.700')}
      visibility={isVisible ? 'visible' : 'hidden'}
      rounded="lg"
      transition={isVisible ? 'height 200ms' : 'none'}
    />
  )
}
