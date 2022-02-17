import React, { useEffect, useState } from 'react'
import { useAnswers } from '../../../contexts/AnswersContext'
import { useHostAvatars } from '../../../contexts/HostAvatarsContext'
import { InputStep, InputStepType, PublicStep } from 'models'
import { GuestBubble } from './bubbles/GuestBubble'
import { TextForm } from './inputs/TextForm'
import { byId, isBubbleStep, isInputStep } from 'utils'
import { DateForm } from './inputs/DateForm'
import { ChoiceForm } from './inputs/ChoiceForm'
import { HostBubble } from './bubbles/HostBubble'
import { isInputValid } from 'services/inputs'
import { useTypebot } from 'contexts/TypebotContext'
import { parseVariables } from 'index'

export const ChatStep = ({
  step,
  onTransitionEnd,
}: {
  step: PublicStep
  onTransitionEnd: (answerContent?: string, isRetry?: boolean) => void
}) => {
  const { addAnswer } = useAnswers()

  const handleInputSubmit = (content: string, isRetry: boolean) => {
    if (!isRetry) addAnswer({ stepId: step.id, blockId: step.blockId, content })
    onTransitionEnd(content, isRetry)
  }

  if (isBubbleStep(step))
    return <HostBubble step={step} onTransitionEnd={onTransitionEnd} />
  if (isInputStep(step))
    return <InputChatStep step={step} onSubmit={handleInputSubmit} />
  return <span>No step</span>
}

const InputChatStep = ({
  step,
  onSubmit,
}: {
  step: InputStep
  onSubmit: (value: string, isRetry: boolean) => void
}) => {
  const { typebot } = useTypebot()
  const { addNewAvatarOffset } = useHostAvatars()
  const [answer, setAnswer] = useState<string>()
  const { variableId } = step.options
  const defaultValue =
    variableId && typebot.variables.find(byId(variableId))?.value

  useEffect(() => {
    addNewAvatarOffset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (value: string) => {
    setAnswer(value)
    onSubmit(value, !isInputValid(value, step.type))
  }

  if (answer) {
    return (
      <GuestBubble
        message={answer}
        showAvatar={typebot.theme.chat.guestAvatar?.isEnabled ?? false}
        avatarSrc={parseVariables(typebot.variables)(
          typebot.theme.chat.guestAvatar?.url
        )}
      />
    )
  }
  switch (step.type) {
    case InputStepType.TEXT:
    case InputStepType.NUMBER:
    case InputStepType.EMAIL:
    case InputStepType.URL:
    case InputStepType.PHONE:
      return (
        <TextForm
          step={step}
          onSubmit={handleSubmit}
          defaultValue={defaultValue}
        />
      )
    case InputStepType.DATE:
      return <DateForm options={step.options} onSubmit={handleSubmit} />
    case InputStepType.CHOICE:
      return <ChoiceForm step={step} onSubmit={handleSubmit} />
  }
}
