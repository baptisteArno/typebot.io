import React, { useState } from 'react'
import { useAnswers } from '../../../contexts/AnswersContext'
import { InputStep, InputStepType } from 'models'
import { GuestBubble } from './bubbles/GuestBubble'
import { TextForm } from './inputs/TextForm'
import { byId } from 'utils'
import { DateForm } from './inputs/DateForm'
import { ChoiceForm } from './inputs/ChoiceForm'
import { useTypebot } from 'contexts/TypebotContext'
import { parseVariables } from '../../../services/variable'
import { isInputValid } from 'services/inputs'
import { PaymentForm } from './inputs/PaymentForm'

export const InputChatStep = ({
  step,
  hasAvatar,
  hasGuestAvatar,
  onTransitionEnd,
}: {
  step: InputStep
  hasGuestAvatar: boolean
  hasAvatar: boolean
  onTransitionEnd: (answerContent?: string, isRetry?: boolean) => void
}) => {
  const { typebot } = useTypebot()
  const { addAnswer } = useAnswers()
  const [answer, setAnswer] = useState<string>()
  const [isEditting, setIsEditting] = useState(false)

  const { variableId } = step.options
  const defaultValue =
    typebot.settings.general.isInputPrefillEnabled ?? true
      ? variableId && typebot.variables.find(byId(variableId))?.value
      : undefined

  const handleSubmit = async (content: string) => {
    setAnswer(content)
    const isRetry = !isInputValid(content, step.type)
    if (!isRetry && addAnswer)
      await addAnswer({
        stepId: step.id,
        blockId: step.blockId,
        content,
        variableId: variableId ?? null,
      })
    if (!isEditting) onTransitionEnd(content, isRetry)
    setIsEditting(false)
  }

  const handleGuestBubbleClick = () => {
    setAnswer(undefined)
    setIsEditting(true)
  }

  if (answer) {
    const avatarUrl = typebot.theme.chat.guestAvatar?.url
    return (
      <GuestBubble
        message={answer}
        showAvatar={typebot.theme.chat.guestAvatar?.isEnabled ?? false}
        avatarSrc={avatarUrl && parseVariables(typebot.variables)(avatarUrl)}
        onClick={handleGuestBubbleClick}
      />
    )
  }

  return (
    <div className="flex">
      {hasAvatar && (
        <div className="flex w-6 xs:w-10 h-6 xs:h-10 mr-2 mb-2 mt-1 flex-shrink-0 items-center" />
      )}
      <Input
        step={step}
        onSubmit={handleSubmit}
        defaultValue={defaultValue?.toString()}
        hasGuestAvatar={hasGuestAvatar}
      />
    </div>
  )
}

const Input = ({
  step,
  onSubmit,
  defaultValue,
  hasGuestAvatar,
}: {
  step: InputStep
  onSubmit: (value: string) => void
  defaultValue?: string
  hasGuestAvatar: boolean
}) => {
  switch (step.type) {
    case InputStepType.TEXT:
    case InputStepType.NUMBER:
    case InputStepType.EMAIL:
    case InputStepType.URL:
    case InputStepType.PHONE:
      return (
        <TextForm
          step={step}
          onSubmit={onSubmit}
          defaultValue={defaultValue}
          hasGuestAvatar={hasGuestAvatar}
        />
      )
    case InputStepType.DATE:
      return <DateForm options={step.options} onSubmit={onSubmit} />
    case InputStepType.CHOICE:
      return <ChoiceForm step={step} onSubmit={onSubmit} />
    case InputStepType.PAYMENT:
      return (
        <PaymentForm
          options={step.options}
          onSuccess={() => onSubmit('Success')}
        />
      )
  }
}
