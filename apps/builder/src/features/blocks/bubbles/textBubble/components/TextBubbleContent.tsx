import { Flex } from '@chakra-ui/react'
import { TextBubbleBlock } from '@typebot.io/schemas'
import React from 'react'
import { PlateBlock } from './plate/PlateBlock'

type Props = {
  block: TextBubbleBlock
}

export const TextBubbleContent = ({ block }: Props) => {
  const isEmpty = block.content.richText.length === 0
  return (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={isEmpty ? '0.5' : '1'}
      className="slate-html-container"
      color={isEmpty ? 'gray.500' : 'inherit'}
    >
      {block.content.richText.map((element, idx) => (
        <PlateBlock key={idx} element={element} />
      ))}
    </Flex>
  )
}
