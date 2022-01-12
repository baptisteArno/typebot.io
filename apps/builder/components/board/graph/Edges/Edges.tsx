import { chakra } from '@chakra-ui/system'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { ChoiceItem } from 'models'
import React, { useMemo } from 'react'
import { isDefined, isSingleChoiceInput } from 'utils'
import { DrawingEdge } from './DrawingEdge'
import { Edge } from './Edge'

export const Edges = () => {
  const { typebot } = useTypebot()
  const stepIdsWithTarget: string[] = useMemo(() => {
    if (!typebot) return []
    return typebot.steps.allIds.filter((stepId) =>
      isDefined(typebot.steps.byId[stepId].target)
    )
  }, [typebot])
  const singleChoiceItemsWithTarget: ChoiceItem[] = useMemo(() => {
    if (!typebot) return []
    return typebot.choiceItems.allIds
      .filter(
        (itemId) =>
          isDefined(typebot.choiceItems.byId[itemId].target) &&
          isSingleChoiceInput(
            typebot.steps.byId[typebot.choiceItems.byId[itemId].stepId]
          )
      )
      .map((itemId) => typebot.choiceItems.byId[itemId])
  }, [typebot])

  return (
    <chakra.svg
      width="full"
      height="full"
      overflow="visible"
      pos="absolute"
      left="0"
      top="0"
    >
      <DrawingEdge />
      {stepIdsWithTarget.map((stepId) => (
        <Edge key={stepId} stepId={stepId} />
      ))}
      {singleChoiceItemsWithTarget.map((item) => (
        <Edge key={item.id} stepId={item.stepId} item={item} />
      ))}
      <marker
        id={'arrow'}
        refX="8"
        refY="4"
        orient="auto"
        viewBox="0 0 20 20"
        markerUnits="userSpaceOnUse"
        markerWidth="20"
        markerHeight="20"
      >
        <path
          d="M7.07138888,5.50174526 L2.43017246,7.82235347 C1.60067988,8.23709976 0.592024983,7.90088146 0.177278692,7.07138888 C0.0606951226,6.83822174 0,6.58111307 0,6.32042429 L0,1.67920787 C0,0.751806973 0.751806973,0 1.67920787,0 C1.93989666,0 2.19700532,0.0606951226 2.43017246,0.177278692 L7,3 C7.82949258,3.41474629 8.23709976,3.92128809 7.82235347,4.75078067 C7.6598671,5.07575341 7.39636161,5.33925889 7.07138888,5.50174526 Z"
          fill="#718096"
        />
      </marker>
    </chakra.svg>
  )
}
