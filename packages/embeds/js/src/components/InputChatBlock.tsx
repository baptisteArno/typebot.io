import type {
  ChatReply,
  ChoiceInputBlock,
  DateInputOptions,
  EmailInputBlock,
  FileInputBlock,
  NumberInputBlock,
  PaymentInputOptions,
  PhoneNumberInputBlock,
  RatingInputBlock,
  RuntimeOptions,
  TextInputBlock,
  Theme,
  UrlInputBlock,
  PictureChoiceBlock,
} from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/enums'
import { GuestBubble } from './bubbles/GuestBubble'
import { BotContext, InputSubmitContent } from '@/types'
import { TextInput } from '@/features/blocks/inputs/textInput'
import { NumberInput } from '@/features/blocks/inputs/number'
import { EmailInput } from '@/features/blocks/inputs/email'
import { UrlInput } from '@/features/blocks/inputs/url'
import { PhoneInput } from '@/features/blocks/inputs/phone'
import { DateForm } from '@/features/blocks/inputs/date'
import { RatingForm } from '@/features/blocks/inputs/rating'
import { FileUploadForm } from '@/features/blocks/inputs/fileUpload'
import { createSignal, Switch, Match, createEffect } from 'solid-js'
import { isNotDefined } from '@typebot.io/lib'
import { isMobile } from '@/utils/isMobileSignal'
import { PaymentForm } from '@/features/blocks/inputs/payment'
import { MultipleChoicesForm } from '@/features/blocks/inputs/buttons/components/MultipleChoicesForm'
import { Buttons } from '@/features/blocks/inputs/buttons/components/Buttons'
import { SinglePictureChoice } from '@/features/blocks/inputs/pictureChoice/SinglePictureChoice'
import { MultiplePictureChoice } from '@/features/blocks/inputs/pictureChoice/MultiplePictureChoice'
import { formattedMessages } from '@/utils/formattedMessagesSignal'

type Props = {
  ref: HTMLDivElement | undefined
  block: NonNullable<ChatReply['input']>
  hasHostAvatar: boolean
  guestAvatar?: Theme['chat']['guestAvatar']
  inputIndex: number
  context: BotContext
  isInputPrefillEnabled: boolean
  hasError: boolean
  onSubmit: (answer: string) => void
  onSkip: () => void
}

export const InputChatBlock = (props: Props) => {
  const [answer, setAnswer] = createSignal<string>()
  const [formattedMessage, setFormattedMessage] = createSignal<string>()

  const handleSubmit = async ({ label, value }: InputSubmitContent) => {
    setAnswer(label ?? value)
    props.onSubmit(value ?? label)
  }

  const handleSkip = (label: string) => {
    setAnswer(label)
    props.onSkip()
  }

  createEffect(() => {
    const formattedMessage = formattedMessages().find(
      (message) => message.inputId === props.block.id
    )?.formattedMessage
    if (formattedMessage) setFormattedMessage(formattedMessage)
  })

  return (
    <Switch>
      <Match when={answer() && !props.hasError}>
        <GuestBubble
          message={formattedMessage() ?? (answer() as string)}
          showAvatar={props.guestAvatar?.isEnabled ?? false}
          avatarSrc={props.guestAvatar?.url && props.guestAvatar.url}
        />
      </Match>
      <Match when={isNotDefined(answer()) || props.hasError}>
        <div
          class="flex justify-end animate-fade-in gap-2"
          data-blockid={props.block.id}
          ref={props.ref}
        >
          {props.hasHostAvatar && (
            <div
              class={
                'flex flex-shrink-0 items-center ' +
                (isMobile() ? 'w-6 h-6' : 'w-10 h-10')
              }
            />
          )}
          <Input
            context={props.context}
            block={props.block}
            inputIndex={props.inputIndex}
            isInputPrefillEnabled={props.isInputPrefillEnabled}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
          />
        </div>
      </Match>
    </Switch>
  )
}

const Input = (props: {
  context: BotContext
  block: NonNullable<ChatReply['input']>
  inputIndex: number
  isInputPrefillEnabled: boolean
  onSubmit: (answer: InputSubmitContent) => void
  onSkip: (label: string) => void
}) => {
  const onSubmit = (answer: InputSubmitContent) => props.onSubmit(answer)

  const getPrefilledValue = () =>
    props.isInputPrefillEnabled ? props.block.prefilledValue : undefined

  const submitPaymentSuccess = () =>
    props.onSubmit({
      value:
        (props.block.options as PaymentInputOptions).labels.success ??
        'Success',
    })

  return (
    <Switch>
      <Match when={props.block.type === InputBlockType.TEXT}>
        <TextInput
          block={props.block as TextInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.NUMBER}>
        <NumberInput
          block={props.block as NumberInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.EMAIL}>
        <EmailInput
          block={props.block as EmailInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.URL}>
        <UrlInput
          block={props.block as UrlInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.PHONE}>
        <PhoneInput
          labels={(props.block as PhoneNumberInputBlock).options.labels}
          defaultCountryCode={
            (props.block as PhoneNumberInputBlock).options.defaultCountryCode
          }
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.DATE}>
        <DateForm
          options={props.block.options as DateInputOptions}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={isButtonsBlock(props.block)} keyed>
        {(block) => (
          <Switch>
            <Match when={!block.options.isMultipleChoice}>
              <Buttons
                inputIndex={props.inputIndex}
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
              />
            </Match>
            <Match when={block.options.isMultipleChoice}>
              <MultipleChoicesForm
                inputIndex={props.inputIndex}
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
              />
            </Match>
          </Switch>
        )}
      </Match>
      <Match when={isPictureChoiceBlock(props.block)} keyed>
        {(block) => (
          <Switch>
            <Match when={!block.options.isMultipleChoice}>
              <SinglePictureChoice
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
              />
            </Match>
            <Match when={block.options.isMultipleChoice}>
              <MultiplePictureChoice
                defaultItems={block.items}
                options={block.options}
                onSubmit={onSubmit}
              />
            </Match>
          </Switch>
        )}
      </Match>
      <Match when={props.block.type === InputBlockType.RATING}>
        <RatingForm
          block={props.block as RatingInputBlock}
          defaultValue={getPrefilledValue()}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.FILE}>
        <FileUploadForm
          context={props.context}
          block={props.block as FileInputBlock}
          onSubmit={onSubmit}
          onSkip={props.onSkip}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.PAYMENT}>
        <PaymentForm
          context={props.context}
          options={
            {
              ...props.block.options,
              ...props.block.runtimeOptions,
            } as PaymentInputOptions & RuntimeOptions
          }
          onSuccess={submitPaymentSuccess}
        />
      </Match>
    </Switch>
  )
}

const isButtonsBlock = (
  block: ChatReply['input']
): ChoiceInputBlock | undefined =>
  block?.type === InputBlockType.CHOICE ? block : undefined

const isPictureChoiceBlock = (
  block: ChatReply['input']
): PictureChoiceBlock | undefined =>
  block?.type === InputBlockType.PICTURE_CHOICE ? block : undefined
