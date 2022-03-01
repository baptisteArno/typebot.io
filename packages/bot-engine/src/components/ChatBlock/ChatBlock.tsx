import React, { useEffect, useRef, useState } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { AvatarSideContainer } from './AvatarSideContainer'
import { useTypebot } from '../../contexts/TypebotContext'
import {
  isBubbleStep,
  isChoiceInput,
  isInputStep,
  isIntegrationStep,
  isLogicStep,
} from 'utils'
import { executeLogic } from 'services/logic'
import { executeIntegration } from 'services/integration'
import { parseRetryStep, stepCanBeRetried } from 'services/inputs'
import { parseVariables } from 'index'
import { useAnswers } from 'contexts/AnswersContext'
import { BubbleStep, InputStep, Step } from 'models'
import { HostBubble } from './ChatStep/bubbles/HostBubble'
import { InputChatStep } from './ChatStep/InputChatStep'

type ChatBlockProps = {
  steps: Step[]
  startStepIndex: number
  onScroll: () => void
  onBlockEnd: (edgeId?: string) => void
}

export const ChatBlock = ({
  steps,
  startStepIndex,
  onScroll,
  onBlockEnd,
}: ChatBlockProps) => {
  const {
    typebot,
    updateVariableValue,
    createEdge,
    apiHost,
    isPreview,
    onNewLog,
  } = useTypebot()
  const { resultValues } = useAnswers()
  const [displayedSteps, setDisplayedSteps] = useState<Step[]>([])
  const bubbleSteps = displayedSteps.filter((step) =>
    isBubbleStep(step)
  ) as BubbleStep[]
  const inputSteps = displayedSteps.filter((step) =>
    isInputStep(step)
  ) as InputStep[]
  const avatarSideContainerRef = useRef<any>()

  useEffect(() => {
    const nextStep = steps[startStepIndex]
    if (nextStep) setDisplayedSteps([...displayedSteps, nextStep])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    avatarSideContainerRef.current?.refreshTopOffset()
    onScroll()
    onNewStepDisplayed()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayedSteps])

  const onNewStepDisplayed = async () => {
    const currentStep = [...displayedSteps].pop()
    if (!currentStep) return
    if (isLogicStep(currentStep)) {
      const nextEdgeId = executeLogic(
        currentStep,
        typebot.variables,
        updateVariableValue
      )
      nextEdgeId ? onBlockEnd(nextEdgeId) : displayNextStep()
    }
    if (isIntegrationStep(currentStep)) {
      const nextEdgeId = await executeIntegration({
        step: currentStep,
        context: {
          apiHost,
          typebotId: typebot.typebotId,
          blockId: currentStep.blockId,
          stepId: currentStep.id,
          variables: typebot.variables,
          isPreview,
          updateVariableValue,
          resultValues,
          blocks: typebot.blocks,
          onNewLog,
        },
      })
      nextEdgeId ? onBlockEnd(nextEdgeId) : displayNextStep()
    }
  }

  const displayNextStep = (answerContent?: string, isRetry?: boolean) => {
    onScroll()
    const currentStep = [...displayedSteps].pop()
    if (currentStep) {
      if (isRetry && stepCanBeRetried(currentStep))
        return setDisplayedSteps([
          ...displayedSteps,
          parseRetryStep(currentStep, typebot.variables, createEdge),
        ])
      if (
        isInputStep(currentStep) &&
        currentStep.options?.variableId &&
        answerContent
      ) {
        updateVariableValue(currentStep.options.variableId, answerContent)
      }
      const isSingleChoiceStep =
        isChoiceInput(currentStep) && !currentStep.options.isMultipleChoice
      if (isSingleChoiceStep) {
        const nextEdgeId = currentStep.items.find(
          (i) => i.content === answerContent
        )?.outgoingEdgeId
        if (nextEdgeId) return onBlockEnd(nextEdgeId)
      }

      if (currentStep?.outgoingEdgeId || displayedSteps.length === steps.length)
        return onBlockEnd(currentStep.outgoingEdgeId)
    }
    const nextStep = steps[displayedSteps.length]
    if (nextStep) setDisplayedSteps([...displayedSteps, nextStep])
  }

  const avatarSrc = typebot.theme.chat.hostAvatar?.url

  return (
    <div className="flex w-full">
      <div className="flex flex-col w-full min-w-0">
        <div className="flex">
          {(typebot.theme.chat.hostAvatar?.isEnabled ?? true) && (
            <AvatarSideContainer
              ref={avatarSideContainerRef}
              hostAvatarSrc={
                avatarSrc && parseVariables(typebot.variables)(avatarSrc)
              }
            />
          )}
          <TransitionGroup>
            {bubbleSteps.map((step) => (
              <CSSTransition
                key={step.id}
                classNames="bubble"
                timeout={500}
                unmountOnExit
              >
                <HostBubble step={step} onTransitionEnd={displayNextStep} />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </div>
        <TransitionGroup>
          {inputSteps.map((step) => (
            <CSSTransition
              key={step.id}
              classNames="bubble"
              timeout={500}
              unmountOnExit
            >
              <InputChatStep
                step={step}
                onTransitionEnd={displayNextStep}
                hasAvatar={typebot.theme.chat.hostAvatar?.isEnabled ?? true}
              />
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
    </div>
  )
}
