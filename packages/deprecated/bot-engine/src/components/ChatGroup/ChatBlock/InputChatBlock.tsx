import React, { useState } from 'react'
import { useAnswers } from '../../../providers/AnswersProvider'
import { InputBlock, InputBlockType } from '@typebot.io/schemas'
import { GuestBubble } from './bubbles/GuestBubble'
import { byId } from '@typebot.io/lib'
import { InputSubmitContent } from '@/types'
import { useTypebot } from '@/providers/TypebotProvider'
import { isInputValid } from '@/utils/inputs'
import { parseVariables } from '@/features/variables'
import { TextInput } from '@/features/blocks/inputs/textInput'
import { NumberInput } from '@/features/blocks/inputs/number'
import { EmailInput } from '@/features/blocks/inputs/email'
import { UrlInput } from '@/features/blocks/inputs/url'
import { PhoneInput } from '@/features/blocks/inputs/phone'
import { DateForm } from '@/features/blocks/inputs/date'
import { ChoiceForm } from '@/features/blocks/inputs/buttons'
import { PaymentForm } from '@/features/blocks/inputs/payment'
import { RatingForm } from '@/features/blocks/inputs/rating'
import { FileUploadForm } from '@/features/blocks/inputs/fileUpload'

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
  const { typebot, isLoading } = useTypebot()
  const { addAnswer } = useAnswers()
  const [answer, setAnswer] = useState<string>()
  const [isEditting, setIsEditting] = useState(false)

  const { variableId } = block.options
  const defaultValue =
    (typebot.settings.general.isInputPrefillEnabled ?? true) && variableId
      ? typebot.variables.find(
          (variable) =>
            variable.name === typebot.variables.find(byId(variableId))?.name
        )?.value
      : undefined

  const handleSubmit = async ({ label, value, itemId }: InputSubmitContent) => {
    setAnswer(label ?? value)
    const isRetry = !isInputValid(value, block.type)
    if (!isRetry && addAnswer)
      await addAnswer(typebot.variables)({
        blockId: block.id,
        groupId: block.groupId,
        content: value,
        variableId,
        uploadedFiles: block.type === InputBlockType.FILE,
      })
    if (!isEditting) onTransitionEnd({ label, value, itemId }, isRetry)
    setIsEditting(false)
  }

  if (isLoading) return null

  if (answer) {
    const avatarUrl = typebot.theme.chat.guestAvatar?.url
    return (
      <GuestBubble
        message={answer}
        showAvatar={typebot.theme.chat.guestAvatar?.isEnabled ?? false}
        avatarSrc={avatarUrl && parseVariables(typebot.variables)(avatarUrl)}
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
      return (
        <TextInput
          block={block}
          onSubmit={onSubmit}
          defaultValue={defaultValue}
          hasGuestAvatar={hasGuestAvatar}
        />
      )
    case InputBlockType.NUMBER:
      return (
        <NumberInput
          block={block}
          onSubmit={onSubmit}
          defaultValue={defaultValue}
          hasGuestAvatar={hasGuestAvatar}
        />
      )
    case InputBlockType.EMAIL:
      return (
        <EmailInput
          block={block}
          onSubmit={onSubmit}
          defaultValue={defaultValue}
          hasGuestAvatar={hasGuestAvatar}
        />
      )
    case InputBlockType.URL:
      return (
        <UrlInput
          block={block}
          onSubmit={onSubmit}
          defaultValue={defaultValue}
          hasGuestAvatar={hasGuestAvatar}
        />
      )
    case InputBlockType.PHONE:
      return (
        <PhoneInput
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
