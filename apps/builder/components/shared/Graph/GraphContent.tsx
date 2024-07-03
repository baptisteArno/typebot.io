import { useTypebot } from 'contexts/TypebotContext'
import React, { memo, useEffect, useMemo, useState } from 'react'
import { AnswersCount } from 'services/analytics'
import { Edges } from './Edges'
import { BlockNode } from './Nodes/BlockNode'
import { useGraph } from 'contexts/GraphContext'
import { isItemVisible } from 'services/graph'
import { Block } from 'models'

type Props = {
  answersCounts?: AnswersCount[]
  onUnlockProPlanClick?: () => void
  graphContainerRef: React.MutableRefObject<HTMLDivElement | null>
}
const MyComponent = memo(
  ({ answersCounts, onUnlockProPlanClick, graphContainerRef }: Props) => {
    const { typebot, hideEdges } = useTypebot()
    const { graphPosition } = useGraph()
    const [isVirtualizationEnabled, setIsVirtualizationEnabled] =
      useState(false)

    useEffect(() => {
      const interval = setTimeout(() => {
        setIsVirtualizationEnabled(true)
        return () => clearTimeout(interval)
      }, 1000)
    }, [])

    const visibleItems = useMemo(
      () =>
        typebot?.blocks.filter((item) =>
          isItemVisible(
            item,
            graphPosition,
            graphContainerRef.current?.offsetWidth,
            graphContainerRef.current?.offsetHeight
          )
        ),
      [typebot?.blocks, graphPosition, graphContainerRef]
    )

    return (
      <>
        {!hideEdges && (
          <Edges
            visibleItems={visibleItems ?? []}
            edges={typebot?.edges ?? []}
            blocks={typebot?.blocks ?? []}
            answersCounts={answersCounts}
            onUnlockProPlanClick={onUnlockProPlanClick}
          />
        )}

        {isVirtualizationEnabled
          ? visibleItems?.map((block) => {
              const blockIndex = typebot?.blocks.findIndex(
                (b) => b.id === block.id
              )
              return (
                <BlockNode
                  block={block}
                  blockIndex={blockIndex ?? 0}
                  key={block.id}
                />
              )
            })
          : typebot?.blocks.map((block, idx) => (
              <BlockNode
                block={block as Block}
                blockIndex={idx}
                key={block.id}
              />
            ))}
      </>
    )
  }
)

// Performance hack, never rerender when graph (parent) is panned
const areEqual = () => true

export default React.memo(MyComponent, areEqual)
