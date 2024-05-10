import { useTypebot } from 'contexts/TypebotContext'
import { Block } from 'models'
import React from 'react'
import { AnswersCount } from 'services/analytics'
import { Edges } from './Edges'
import { BlockNode } from './Nodes/BlockNode'

type Props = {
  answersCounts?: AnswersCount[]
  onUnlockProPlanClick?: () => void
}
const MyComponent = ({ answersCounts, onUnlockProPlanClick }: Props) => {
  const { typebot } = useTypebot()
  return (
    <>
      <Edges
        edges={typebot?.edges ?? []}
        blocks={typebot?.blocks ?? []}
        answersCounts={answersCounts}
        onUnlockProPlanClick={onUnlockProPlanClick}
      />
      {typebot?.blocks.map((block, idx) => (
        <BlockNode block={block as Block} blockIndex={idx} key={block.id} />
      ))}
    </>
  )
}

// Performance hack, never rerender when graph (parent) is panned
const areEqual = () => true

export default React.memo(MyComponent, areEqual)
