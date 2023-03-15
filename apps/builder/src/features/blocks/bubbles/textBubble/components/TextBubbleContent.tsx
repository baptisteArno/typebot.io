import { Flex } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { TextBubbleBlock } from '@typebot.io/schemas'
import React from 'react'
import { isEmpty } from '@typebot.io/lib'
import { parseVariableHtmlTags } from '@/features/variables/helpers/parseVariableHtmlTags'

type Props = {
  block: TextBubbleBlock
}

export const TextBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot()
  return (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={block.content.html === '' ? '0.5' : '1'}
      className="slate-html-container"
      color={isEmpty(block.content.plainText) ? 'gray.500' : 'inherit'}
      dangerouslySetInnerHTML={{
        __html: isEmpty(block.content.plainText)
          ? `<p>Click to edit...</p>`
          : parseVariableHtmlTags(block.content.html, typebot?.variables ?? []),
      }}
    />
  )
}
