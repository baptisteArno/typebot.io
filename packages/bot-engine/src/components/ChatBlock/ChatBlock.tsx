import React, { useEffect, useState } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { ChatStep } from './ChatStep'
import { AvatarSideContainer } from './AvatarSideContainer'
import { HostAvatarsContext } from '../../contexts/HostAvatarsContext'
import { PublicStep } from 'models'
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

type ChatBlockProps = {
  steps: PublicStep[]
  startStepIndex: number
  blockIndex: number
  onScroll: () => void
  onBlockEnd: (edgeId?: string) => void
}

export const ChatBlock = ({
  steps,
  startStepIndex,
  blockIndex,
  onScroll,
  onBlockEnd,
}: ChatBlockProps) => {
  const { typebot, updateVariableValue, createEdge } = useTypebot()
  const [displayedSteps, setDisplayedSteps] = useState<PublicStep[]>([])

  const currentStepIndex = displayedSteps.length - 1

  useEffect(() => {
    const nextStep = steps[startStepIndex]
    if (nextStep) setDisplayedSteps([...displayedSteps, nextStep])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
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
      const nextEdgeId = await executeIntegration(
        typebot.typebotId,
        currentStep,
        typebot.variables,
        { blockIndex, stepIndex: currentStepIndex },
        updateVariableValue
      )
      nextEdgeId ? onBlockEnd(nextEdgeId) : displayNextStep()
    }
  }

  const displayNextStep = (answerContent?: string, isRetry?: boolean) => {
    const currentStep = [...displayedSteps].pop()
    console.log(currentStep)
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
        onBlockEnd(
          currentStep.items.find((i) => i.content === answerContent)
            ?.outgoingEdgeId
        )
      }

      if (currentStep?.outgoingEdgeId || displayedSteps.length === steps.length)
        return onBlockEnd(currentStep.outgoingEdgeId)
    }
    const nextStep = steps[displayedSteps.length]
    if (nextStep) setDisplayedSteps([...displayedSteps, nextStep])
  }

  return (
    <div className="flex">
      <HostAvatarsContext>
        <AvatarSideContainer />
        <div className="flex flex-col w-full">
          <TransitionGroup>
            {displayedSteps
              .filter((step) => isInputStep(step) || isBubbleStep(step))
              .map((step) => (
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
