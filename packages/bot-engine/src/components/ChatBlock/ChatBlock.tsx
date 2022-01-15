import React, { useEffect, useState } from 'react'
import { animateScroll as scroll } from 'react-scroll'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { ChatStep } from './ChatStep'
import { AvatarSideContainer } from './AvatarSideContainer'
import { HostAvatarsContext } from '../../contexts/HostAvatarsContext'
import {
  ChoiceInputStep,
  ComparisonOperators,
  ConditionStep,
  LogicalOperator,
  LogicStep,
  LogicStepType,
  Step,
  Target,
} from 'models'
import { useTypebot } from '../../contexts/TypebotContext'
import {
  isChoiceInput,
  isDefined,
  isInputStep,
  isLogicStep,
  isTextBubbleStep,
} from 'utils'
import {
  evaluateExpression,
  isMathFormula,
  parseVariables,
} from 'services/variable'

type ChatBlockProps = {
  stepIds: string[]
  startStepId?: string
  onBlockEnd: (target?: Target) => void
}

export const ChatBlock = ({
  stepIds,
  startStepId,
  onBlockEnd,
}: ChatBlockProps) => {
  const { typebot, updateVariableValue } = useTypebot()
  const [displayedSteps, setDisplayedSteps] = useState<Step[]>([])

  useEffect(() => {
    const nextStep =
      typebot.steps.byId[startStepId ?? stepIds[displayedSteps.length]]
    if (nextStep) setDisplayedSteps([...displayedSteps, nextStep])
  }, [])

  useEffect(() => {
    autoScrollToBottom()
    const currentStep = [...displayedSteps].pop()
    if (currentStep && isLogicStep(currentStep)) {
      const target = executeLogic(currentStep)
      target ? onBlockEnd(target) : displayNextStep()
    }
  }, [displayedSteps])

  const autoScrollToBottom = () => {
    scroll.scrollToBottom({
      duration: 500,
      containerId: 'scrollable-container',
    })
  }

  const displayNextStep = (answerContent?: string) => {
    const currentStep = [...displayedSteps].pop()
    if (currentStep) {
      if (
        isInputStep(currentStep) &&
        currentStep.options?.variableId &&
        answerContent
      ) {
        updateVariableValue(currentStep.options.variableId, answerContent)
      }
      const isSingleChoiceStep =
        isChoiceInput(currentStep) && !currentStep.options.isMultipleChoice
      if (isSingleChoiceStep)
        return onBlockEnd(getSingleChoiceTargetId(currentStep, answerContent))
      if (
        currentStep?.target?.blockId ||
        displayedSteps.length === stepIds.length
      )
        return onBlockEnd(currentStep?.target)
    }
    const nextStep = typebot.steps.byId[stepIds[displayedSteps.length]]
    if (nextStep) setDisplayedSteps([...displayedSteps, nextStep])
  }

  const executeLogic = (step: LogicStep): Target | undefined => {
    switch (step.type) {
      case LogicStepType.SET_VARIABLE: {
        if (!step.options?.variableId || !step.options.expressionToEvaluate)
          return
        const expression = step.options.expressionToEvaluate
        const evaluatedExpression = isMathFormula(expression)
          ? evaluateExpression(parseVariables(expression, typebot.variables))
          : expression
        updateVariableValue(step.options.variableId, evaluatedExpression)
        return
      }
      case LogicStepType.CONDITION: {
        const isConditionPassed =
          step.options?.logicalOperator === LogicalOperator.AND
            ? step.options?.comparisons.allIds.every(executeComparison(step))
            : step.options?.comparisons.allIds.some(executeComparison(step))
        return isConditionPassed ? step.trueTarget : step.falseTarget
      }
    }
  }

  const executeComparison = (step: ConditionStep) => (comparisonId: string) => {
    const comparison = step.options?.comparisons.byId[comparisonId]
    if (!comparison?.variableId) return false
    const inputValue = typebot.variables.byId[comparison.variableId].value ?? ''
    const { value } = comparison
    if (!isDefined(value)) return false
    switch (comparison.comparisonOperator) {
      case ComparisonOperators.CONTAINS: {
        return inputValue.includes(value)
      }
      case ComparisonOperators.EQUAL: {
        return inputValue === value
      }
      case ComparisonOperators.NOT_EQUAL: {
        return inputValue !== value
      }
      case ComparisonOperators.GREATER: {
        return parseFloat(inputValue) >= parseFloat(value)
      }
      case ComparisonOperators.LESS: {
        return parseFloat(inputValue) <= parseFloat(value)
      }
      case ComparisonOperators.IS_SET: {
        return isDefined(inputValue) && inputValue.length > 0
      }
    }
  }

  const getSingleChoiceTargetId = (
    currentStep: ChoiceInputStep,
    answerContent?: string
  ): Target | undefined => {
    const itemId = currentStep.options.itemIds.find(
      (itemId) => typebot.choiceItems.byId[itemId].content === answerContent
    )
    if (!itemId) throw new Error('itemId should exist')
    return typebot.choiceItems.byId[itemId].target ?? currentStep.target
  }

  return (
    <div className="flex">
      <HostAvatarsContext>
        <AvatarSideContainer />
        <div className="flex flex-col w-full">
          <TransitionGroup>
            {displayedSteps
              .filter((step) => isInputStep(step) || isTextBubbleStep(step))
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
