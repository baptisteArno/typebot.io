import React, { useEffect, useState } from 'react'
import { useHostAvatars } from '../../../contexts/HostAvatarsContext'
import { Step } from '../../../models'
import { isTextInputStep, isTextStep } from '../../../services/utils'
import { GuestBubble } from './bubbles/GuestBubble'
import { HostMessageBubble } from './bubbles/HostMessageBubble'
import { TextInput } from './inputs/TextInput'

export const ChatStep = ({
  step,
  onTransitionEnd,
}: {
  step: Step
  onTransitionEnd: () => void
}) => {
  if (isTextStep(step))
    return <HostMessageBubble step={step} onTransitionEnd={onTransitionEnd} />
  if (isTextInputStep(step)) return <InputChatStep onSubmit={onTransitionEnd} />
  return <span>No step</span>
}

const InputChatStep = ({ onSubmit }: { onSubmit: () => void }) => {
  const { addNewAvatarOffset } = useHostAvatars()
  const [answer, setAnswer] = useState<string>()

  useEffect(() => {
    addNewAvatarOffset()
  }, [])

  const handleSubmit = (value: string) => {
    setAnswer(value)
    onSubmit()
  }

  if (answer) {
    return <GuestBubble message={answer} />
  }
  return <TextInput onSubmit={handleSubmit} />
}
