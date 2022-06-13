import { Flex } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { EndConversationStep, TextBubbleStep } from 'models'
import React from 'react'
import { parseVariableHighlight } from 'services/utils'

type Props = {
  step: TextBubbleStep | EndConversationStep
}

export const TextBubbleContent = ({ step }: Props) => {
  const { typebot } = useTypebot()
  if (!typebot) return <></>
  return (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={step.content.html === '' ? '0.5' : '1'}
      className="slate-html-container"
      dangerouslySetInnerHTML={{
        __html:
          step.content.html === ''
            ? `<p>Clique para editar...</p>`
            : parseVariableHighlight(step.content.html, typebot),
      }}
    />
  )
}
