import { Flex } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { TextBubbleStep } from 'models'
import React from 'react'
import { parseVariableHighlight } from 'services/utils'

type Props = {
  step: TextBubbleStep
}

export const TextBubbleNodeContent = ({ step }: Props) => {
  const { typebot } = useTypebot()
  return (
    <Flex
      flexDir={'column'}
      opacity={step.content.html === '' ? '0.5' : '1'}
      className="slate-html-container"
      dangerouslySetInnerHTML={{
        __html:
          step.content.html === ''
            ? `<p>Click to edit...</p>`
            : parseVariableHighlight(step.content.html, typebot),
      }}
    />
  )
}
