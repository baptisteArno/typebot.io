import React, { useEffect, useState } from 'react'
import { animateScroll as scroll } from 'react-scroll'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { ChatStep } from './ChatStep'
import { AvatarSideContainer } from './AvatarSideContainer'
import { HostAvatarsContext } from '../../contexts/HostAvatarsContext'
import { ChoiceInputStep, Step } from 'models'
import { useTypebot } from '../../contexts/TypebotContext'
import { isChoiceInput } from 'utils'

type ChatBlockProps = {
  stepIds: string[]
  onBlockEnd: (nextBlockId?: string) => void
}

export const ChatBlock = ({ stepIds, onBlockEnd }: ChatBlockProps) => {
  const { typebot } = useTypebot()
  const [displayedSteps, setDisplayedSteps] = useState<Step[]>([])

  useEffect(() => {
    setDisplayedSteps([typebot.steps.byId[stepIds[0]]])
  }, [])

  useEffect(() => {
    autoScrollToBottom()
  }, [displayedSteps])

  const autoScrollToBottom = () => {
    scroll.scrollToBottom({
      duration: 500,
      containerId: 'scrollable-container',
    })
  }

  const displayNextStep = (answerContent?: string) => {
    const currentStep = [...displayedSteps].pop()
    if (!currentStep) throw new Error('currentStep should exist')
    const isSingleChoiceStep =
      isChoiceInput(currentStep) && !currentStep.options.isMultipleChoice
    if (isSingleChoiceStep)
      return onBlockEnd(getSingleChoiceTargetId(currentStep, answerContent))
    if (
      currentStep?.target?.blockId ||
      displayedSteps.length === stepIds.length
    )
      return onBlockEnd(currentStep?.target?.blockId)
    const nextStep = typebot.steps.byId[stepIds[displayedSteps.length]]
    if (nextStep) setDisplayedSteps([...displayedSteps, nextStep])
  }

  const getSingleChoiceTargetId = (
    currentStep: ChoiceInputStep,
    answerContent?: string
  ) => {
    const itemId = currentStep.options.itemIds.find(
      (itemId) => typebot.choiceItems.byId[itemId].content === answerContent
    )
    if (!itemId) throw new Error('itemId should exist')
    const targetId =
      typebot.choiceItems.byId[itemId].target?.blockId ??
      currentStep.target?.blockId
    return targetId
  }

  return (
    <div className="flex">
      <HostAvatarsContext>
        <AvatarSideContainer />
        <div className="flex flex-col w-full">
          <TransitionGroup>
            {displayedSteps.map((step) => (
              <CSSTransition
                key={step.id}
                classNames="bubble"
                timeout={500}
                unmountOnExit
              >
                <ChatStep step={step} onTransitionEnd={displayNextStep} />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
      </HostAvatarsContext>
    </div>
  )
}
