import {
  ChatReply,
  ChoiceInputBlock,
  DateInputOptions,
  EmailInputBlock,
  FileInputBlock,
  InputBlockType,
  NumberInputBlock,
  PaymentInputOptions,
  PhoneNumberInputBlock,
  RatingInputBlock,
  RuntimeOptions,
  TextInputBlock,
  Theme,
  UrlInputBlock,
} from 'models'
import { GuestBubble } from './bubbles/GuestBubble'
import { BotContext, InputSubmitContent } from '@/types'
import { TextInput } from '@/features/blocks/inputs/textInput'
import { NumberInput } from '@/features/blocks/inputs/number'
import { EmailInput } from '@/features/blocks/inputs/email'
import { UrlInput } from '@/features/blocks/inputs/url'
import { PhoneInput } from '@/features/blocks/inputs/phone'
import { DateForm } from '@/features/blocks/inputs/date'
import { ChoiceForm } from '@/features/blocks/inputs/buttons'
import { RatingForm } from '@/features/blocks/inputs/rating'
import { FileUploadForm } from '@/features/blocks/inputs/fileUpload'
import { createSignal, Switch, Match } from 'solid-js'
import { isNotDefined } from 'utils'
import { isMobile } from '@/utils/isMobileSignal'
import { PaymentForm } from '@/features/blocks/inputs/payment'

type Props = {
  block: NonNullable<ChatReply['input']>
  guestAvatar?: Theme['chat']['guestAvatar']
  inputIndex: number
  context: BotContext
  onSubmit: (answer: string) => void
  onSkip: () => void
}

export const InputChatBlock = (props: Props) => {
  const [answer, setAnswer] = createSignal<string>()

  const handleSubmit = async ({ label, value }: InputSubmitContent) => {
    setAnswer(label ?? value)
    props.onSubmit(value)
  }

  return (
    <Switch>
      <Match when={answer()} keyed>
        {(answer) => (
          <GuestBubble
            message={answer}
            showAvatar={props.guestAvatar?.isEnabled ?? false}
            avatarSrc={props.guestAvatar?.url && props.guestAvatar.url}
          />
        )}
      </Match>
      <Match when={isNotDefined(answer())}>
        <div class="flex justify-end animate-fade-in">
          {props.guestAvatar?.isEnabled && (
            <div
              class={
                'flex mr-2 mb-2 mt-1 flex-shrink-0 items-center ' +
                (isMobile() ? 'w-6 h-6' : 'w-10 h-10')
              }
            />
          )}
          <Input
            context={props.context}
            block={props.block}
            inputIndex={props.inputIndex}
            onSubmit={handleSubmit}
            onSkip={() => props.onSkip()}
            hasGuestAvatar={props.guestAvatar?.isEnabled ?? false}
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
  hasGuestAvatar: boolean
  onSubmit: (answer: InputSubmitContent) => void
  onSkip: () => void
}) => {
  const onSubmit = (answer: InputSubmitContent) => props.onSubmit(answer)

  return (
    <Switch>
      <Match when={props.block.type === InputBlockType.TEXT}>
        <TextInput
          block={props.block as TextInputBlock & { prefilledValue?: string }}
          onSubmit={onSubmit}
          hasGuestAvatar={props.hasGuestAvatar}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.NUMBER}>
        <NumberInput
          block={props.block as NumberInputBlock & { prefilledValue?: string }}
          onSubmit={onSubmit}
          hasGuestAvatar={props.hasGuestAvatar}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.EMAIL}>
        <EmailInput
          block={props.block as EmailInputBlock & { prefilledValue?: string }}
          onSubmit={onSubmit}
          hasGuestAvatar={props.hasGuestAvatar}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.URL}>
        <UrlInput
          block={props.block as UrlInputBlock & { prefilledValue?: string }}
          onSubmit={onSubmit}
          hasGuestAvatar={props.hasGuestAvatar}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.PHONE}>
        <PhoneInput
          block={
            props.block as PhoneNumberInputBlock & { prefilledValue?: string }
          }
          onSubmit={onSubmit}
          hasGuestAvatar={props.hasGuestAvatar}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.DATE}>
        <DateForm
          options={props.block.options as DateInputOptions}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.CHOICE}>
        <ChoiceForm
          inputIndex={props.inputIndex}
          block={props.block as ChoiceInputBlock}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.RATING}>
        <RatingForm
          block={props.block as RatingInputBlock & { prefilledValue?: string }}
          onSubmit={onSubmit}
        />
      </Match>
      <Match when={props.block.type === InputBlockType.FILE}>
        <FileUploadForm
          context={props.context}
          block={props.block as FileInputBlock}
          onSubmit={onSubmit}
          // eslint-disable-next-line solid/reactivity
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
          onSuccess={() =>
            props.onSubmit({
              value:
                (props.block.options as PaymentInputOptions).labels.success ??
                'Success',
            })
          }
        />
      </Match>
    </Switch>
  )
}
