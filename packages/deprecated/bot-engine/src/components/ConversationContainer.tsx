import React, { useEffect, useRef, useState } from 'react'
import { ChatGroup } from './ChatGroup'
import { useAnswers } from '../providers/AnswersProvider'
import {
  Group,
  Edge,
  PublicTypebot,
  Theme,
  VariableWithValue,
} from '@typebot.io/schemas'
import { byId, isDefined, isInputBlock, isNotDefined } from '@typebot.io/lib'
import { animateScroll as scroll } from 'react-scroll'
import { LinkedTypebot, useTypebot } from '@/providers/TypebotProvider'
import { setCssVariablesValue } from '@/features/theme'
import { ChatProvider } from '@/providers/ChatProvider'

type Props = {
  theme: Theme
  predefinedVariables?: { [key: string]: string | undefined }
  startGroupId?: string
  onNewGroupVisible: (edge: Edge) => void
  onCompleted: () => void
}
export const ConversationContainer = ({
  theme,
  predefinedVariables,
  startGroupId,
  onNewGroupVisible,
  onCompleted,
}: Props) => {
  const {
    typebot,
    updateVariableValue,
    linkedBotQueue,
    popEdgeIdFromLinkedTypebotQueue,
  } = useTypebot()
  const [displayedGroups, setDisplayedGroups] = useState<
    { group: Group; startBlockIndex: number }[]
  >([])
  const { updateVariables } = useAnswers()
  const bottomAnchor = useRef<HTMLDivElement | null>(null)
  const scrollableContainer = useRef<HTMLDivElement | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  const displayNextGroup = ({
    edgeId,
    updatedTypebot,
    groupId,
  }: {
    edgeId?: string
    groupId?: string
    updatedTypebot?: PublicTypebot | LinkedTypebot
  }) => {
    const currentTypebot = updatedTypebot ?? typebot
    if (groupId) {
      const nextGroup = currentTypebot.groups.find(byId(groupId))
      if (!nextGroup) return
      onNewGroupVisible({
        id: 'edgeId',
        from: { groupId: 'block', blockId: 'block' },
        to: { groupId },
      })
      return setDisplayedGroups([
        ...displayedGroups,
        { group: nextGroup, startBlockIndex: 0 },
      ])
    }
    const nextEdge = currentTypebot.edges.find(byId(edgeId))
    if (!nextEdge) {
      if (linkedBotQueue.length > 0) {
        const nextEdgeId = linkedBotQueue[0].edgeId
        popEdgeIdFromLinkedTypebotQueue()
        displayNextGroup({ edgeId: nextEdgeId })
      }
      return onCompleted()
    }
    const nextGroup = currentTypebot.groups.find(byId(nextEdge.to.groupId))
    if (!nextGroup) return onCompleted()
    const startBlockIndex = nextEdge.to.blockId
      ? nextGroup.blocks.findIndex(byId(nextEdge.to.blockId))
      : 0
    onNewGroupVisible(nextEdge)
    setDisplayedGroups([
      ...displayedGroups,
      {
        group: nextGroup,
        startBlockIndex: startBlockIndex === -1 ? 0 : startBlockIndex,
      },
    ])
  }

  useEffect(() => {
    if (hasStarted) return
    if (
      isDefined(predefinedVariables) &&
      Object.keys(predefinedVariables).length > 0
    ) {
      const prefilledVariables = injectPredefinedVariables(predefinedVariables)
      updateVariables(prefilledVariables)
    }
    setHasStarted(true)
    const startEdge = typebot.groups[0].blocks[0].outgoingEdgeId
    if (!startEdge && !startGroupId) return
    displayNextGroup({
      edgeId: startGroupId ? undefined : startEdge,
      groupId: startGroupId,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predefinedVariables])

  const injectPredefinedVariables = (predefinedVariables: {
    [key: string]: string | undefined
  }) => {
    const prefilledVariables: VariableWithValue[] = []
    Object.keys(predefinedVariables).forEach((key) => {
      const matchingVariable = typebot.variables.find(
        (v) => v.name.toLowerCase() === key.toLowerCase()
      )
      if (!predefinedVariables || isNotDefined(matchingVariable)) return
      const value = predefinedVariables[key]
      if (!value) return
      updateVariableValue(matchingVariable?.id, value)
      prefilledVariables.push({ ...matchingVariable, value })
    })
    return prefilledVariables
  }

  useEffect(() => {
    if (!document) return
    setCssVariablesValue(theme, document.body.style)
  }, [theme])

  const autoScrollToBottom = () => {
    if (!scrollableContainer.current) return
    setTimeout(() => {
      scroll.scrollToBottom({
        duration: 500,
        container: scrollableContainer.current,
      })
    }, 1)
  }

  return (
    <div
      ref={scrollableContainer}
      className="overflow-y-scroll w-full lg:w-3/4 min-h-full rounded lg:px-5 px-3 pt-10 relative scrollable-container typebot-chat-view"
    >
      <ChatProvider onScroll={autoScrollToBottom}>
        {displayedGroups.map((displayedGroup, idx) => {
          const groupAfter = displayedGroups[idx + 1]
          const groupAfterStartsWithInput =
            groupAfter &&
            isInputBlock(groupAfter.group.blocks[groupAfter.startBlockIndex])
          return (
            <ChatGroup
              key={displayedGroup.group.id + idx}
              blocks={displayedGroup.group.blocks}
              startBlockIndex={displayedGroup.startBlockIndex}
              onGroupEnd={displayNextGroup}
              groupTitle={displayedGroup.group.title}
              keepShowingHostAvatar={
                idx === displayedGroups.length - 1 || groupAfterStartsWithInput
              }
            />
          )
        })}
      </ChatProvider>

      {/* We use a block to simulate padding because it makes iOS scroll flicker */}
      <div className="w-full h-32" ref={bottomAnchor} />
    </div>
  )
}
