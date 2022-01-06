import { useAnalyticsGraph } from 'contexts/AnalyticsGraphProvider'
import React, { useMemo } from 'react'
import { computeDropOffPath } from 'services/graph'

type Props = {
  blockId: string
}
export const DropOffEdge = ({ blockId }: Props) => {
  const { typebot } = useAnalyticsGraph()

  const path = useMemo(() => {
    if (!typebot) return
    const block = typebot.blocks.byId[blockId]
    if (!block) return ''
    return computeDropOffPath(block.graphCoordinates, block.stepIds.length - 1)
  }, [blockId, typebot])

  return <path d={path} stroke={'#E53E3E'} strokeWidth="2px" fill="none" />
}
