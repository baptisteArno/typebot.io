import { TypebotLinkStep } from 'models'
import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { byId } from 'utils'

type Props = {
  step: TypebotLinkStep
}

export const TypebotLinkContent = ({ step }: Props) => {
  const { linkedTypebots, typebot } = useTypebot()
  const isCurrentTypebot =
    typebot &&
    (step.options.typebotId === typebot.id ||
      step.options.typebotId === 'current')
  const linkedTypebot = isCurrentTypebot
    ? typebot
    : linkedTypebots?.find(byId(step.options.typebotId))
  const blockTitle = linkedTypebot?.blocks.find(
    byId(step.options.blockId)
  )?.title
  if (!step.options.typebotId) return <Text color="gray.500">Configure...</Text>
  return (
    <Text>
      Jump{' '}
      {blockTitle ? (
        <>
          to <Tag>{blockTitle}</Tag>
        </>
      ) : (
        <></>
      )}{' '}
      {!isCurrentTypebot ? (
        <>
          in <Tag colorScheme="blue">{linkedTypebot?.name}</Tag>
        </>
      ) : (
        <></>
      )}
    </Text>
  )
}
