import { Flex } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { TextBubbleBlock } from 'models'
import React from 'react'
import { parseVariableHighlight } from '@/utils/helpers'

type Props = {
  block: TextBubbleBlock
}

export const TextBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot()
  if (!typebot) return <></>
  return (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={block.content.html === '' ? '0.5' : '1'}
      className="slate-html-container"
      dangerouslySetInnerHTML={{
        __html:
          block.content.html === ''
            ? `<p>Click to edit...</p>`
            : parseVariableHighlight(block.content.html, typebot),
      }}
    />
  )
}
