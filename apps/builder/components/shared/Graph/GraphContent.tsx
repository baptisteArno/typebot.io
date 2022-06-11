import { useTypebot } from 'contexts/TypebotContext'
import { Group } from 'models'
import React from 'react'
import { AnswersCount } from 'services/analytics'
import { Edges } from './Edges'
import { GroupNode } from './Nodes/GroupNode'

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
        answersCounts={answersCounts}
        onUnlockProPlanClick={onUnlockProPlanClick}
      />
      {typebot?.groups.map((group, idx) => (
        <GroupNode group={group as Group} groupIndex={idx} key={group.id} />
      ))}
    </>
  )
}

// Performance hack, never rerender when graph (parent) is panned
const areEqual = () => true

export default React.memo(MyComponent, areEqual)
