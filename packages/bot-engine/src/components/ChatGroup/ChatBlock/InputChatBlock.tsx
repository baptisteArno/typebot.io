import React, { useState } from 'react'
import { useAnswers } from '../../../contexts/AnswersContext'
import { InputBlock, InputBlockType } from 'models'
import { GuestBubble } from './bubbles/GuestBubble'
import { TextForm } from './inputs/TextForm'
import { byId } from 'utils'
import { DateForm } from './inputs/DateForm'
import { ChoiceForm } from './inputs/ChoiceForm'
import { useTypebot } from 'contexts/TypebotContext'
import { parseVariables } from '../../../services/variable'
import { isInputValid } from 'services/inputs'
import { PaymentForm } from './inputs/PaymentForm'
import { RatingForm } from './inputs/RatingForm'
import { FileUploadForm } from './inputs/FileUploadForm'

export type InputSubmitContent = {
  label?: string
  value: string
  itemId?: string
}

export const InputChatBlock = ({
  block,
  hasAvatar,
  hasGuestAvatar,
  onTransitionEnd,
  onSkip,
}: {
  block: InputBlock
  hasGuestAvatar: boolean
  hasAvatar: boolean
  onTransitionEnd: (
    answerContent?: InputSubmitContent,
    isRetry?: boolean
  ) => void
  onSkip: () => void
}) => {
  const { typebot } = useTypebot()
  const { addAnswer } = useAnswers()
  const [answer, setAnswer] = useState<string>()
  const [isEditting, setIsEditting] = useState(false)

  const { variableId } = block.options
  const defaultValue =
    typebot.settings.general.isInputPrefillEnabled ?? true
      ? variableId && typebot.variables.find(byId(variableId))?.value
      : undefined

  const handleSubmit = async ({ label, value, itemId }: InputSubmitContent) => {
    setAnswer(label ?? value)
    const isRetry = !isInputValid(value, block.type)
    if (!isRetry && addAnswer)
      await addAnswer({
        blockId: block.id,
        groupId: block.groupId,
        content: value,
        variableId: variableId ?? null,
        uploadedFiles: block.type === InputBlockType.FILE,
      })
    if (!isEditting) onTransitionEnd({ label, value, itemId }, isRetry)
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
    <div className="flex justify-end">
      {hasAvatar && (
        <div className="flex w-6 xs:w-10 h-6 xs:h-10 mr-2 mb-2 mt-1 flex-shrink-0 items-center" />
      )}
      <Input
        block={block}
        onSubmit={handleSubmit}
        onSkip={onSkip}
        defaultValue={defaultValue?.toString()}
        hasGuestAvatar={hasGuestAvatar}
      />
    </div>
  )
}

const Input = ({
  block,
  onSubmit,
  onSkip,
  defaultValue,
  hasGuestAvatar,
}: {
  block: InputBlock
  onSubmit: (value: InputSubmitContent) => void
  onSkip: () => void
  defaultValue?: string
  hasGuestAvatar: boolean
}) => {
  switch (block.type) {
    case InputBlockType.TEXT:
    case InputBlockType.NUMBER:
    case InputBlockType.EMAIL:
    case InputBlockType.URL:
    case InputBlockType.PHONE:
      return (
        <TextForm
          block={block}
          onSubmit={onSubmit}
          defaultValue={defaultValue}
          hasGuestAvatar={hasGuestAvatar}
        />
      )
    case InputBlockType.DATE:
      return <DateForm options={block.options} onSubmit={onSubmit} />
    case InputBlockType.CHOICE:
      return <ChoiceForm block={block} onSubmit={onSubmit} />
    case InputBlockType.PAYMENT:
      return (
        <PaymentForm
          options={block.options}
          onSuccess={() =>
            onSubmit({ value: block.options.labels.success ?? 'Success' })
          }
        />
      )
    case InputBlockType.RATING:
      return <RatingForm block={block} onSubmit={onSubmit} />
    case InputBlockType.FILE:
      return (
        <FileUploadForm block={block} onSubmit={onSubmit} onSkip={onSkip} />
      )
  }
}
