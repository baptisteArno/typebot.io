import React, { useEffect, useState } from 'react'
import { useAnswers } from '../../../contexts/AnswersContext'
import { useHostAvatars } from '../../../contexts/HostAvatarsContext'
import { InputStep, InputStepType, Step } from 'models'
import { GuestBubble } from './bubbles/GuestBubble'
import { HostMessageBubble } from './bubbles/HostMessageBubble'
import { TextInput } from './inputs/TextInput'
import { isInputStep, isTextBubbleStep, isTextInputStep } from 'utils'
import { NumberInput } from './inputs/NumberInput'

export const ChatStep = ({
  step,
  onTransitionEnd,
}: {
  step: Step
  onTransitionEnd: () => void
}) => {
  const { addAnswer } = useAnswers()

  const handleInputSubmit = (content: string) => {
    addAnswer({ stepId: step.id, blockId: step.blockId, content })
    onTransitionEnd()
  }

  if (isTextBubbleStep(step))
    return <HostMessageBubble step={step} onTransitionEnd={onTransitionEnd} />
  if (isInputStep(step))
    return <InputChatStep step={step} onSubmit={handleInputSubmit} />
  return <span>No step</span>
}

const InputChatStep = ({
  step,
  onSubmit,
}: {
  step: InputStep
  onSubmit: (value: string) => void
}) => {
  const { addNewAvatarOffset } = useHostAvatars()
  const [answer, setAnswer] = useState<string>()

  useEffect(() => {
    addNewAvatarOffset()
  }, [])

  const handleSubmit = (value: string) => {
    setAnswer(value)
    onSubmit(value)
  }

  if (answer) {
    return <GuestBubble message={answer} />
  }
  switch (step.type) {
    case InputStepType.TEXT:
      return <TextInput step={step} onSubmit={handleSubmit} />
    case InputStepType.NUMBER:
      return <NumberInput step={step} onSubmit={handleSubmit} />
  }
}
