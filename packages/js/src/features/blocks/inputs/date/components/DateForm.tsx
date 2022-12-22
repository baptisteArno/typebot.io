import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { DateInputOptions } from 'models'
import { createSignal } from 'solid-js'
import { parseReadableDate } from '../utils/parseReadableDate'

type Props = {
  onSubmit: (inputValue: InputSubmitContent) => void
  options?: DateInputOptions
}

export const DateForm = (props: Props) => {
  const [inputValues, setInputValues] = createSignal({ from: '', to: '' })
  return (
    <div class="flex flex-col w-full lg:w-4/6">
      <div class="flex items-center">
        <form
          class={'flex justify-between rounded-lg typebot-input pr-2 items-end'}
          onSubmit={(e) => {
            if (inputValues().from === '' && inputValues().to === '') return
            e.preventDefault()
            props.onSubmit({
              value: `${inputValues().from}${
                props.options?.isRange ? ` to ${inputValues().to}` : ''
              }`,
              label: parseReadableDate({
                ...inputValues(),
                hasTime: props.options?.hasTime,
                isRange: props.options?.isRange,
              }),
            })
          }}
        >
          <div class="flex flex-col">
            <div
              class={
                'flex items-center p-4 ' +
                (props.options?.isRange ? 'pb-0' : '')
              }
            >
              {props.options?.isRange && (
                <p class="font-semibold mr-2">
                  {props.options.labels?.from ?? 'From:'}
                </p>
              )}
              <input
                class="focus:outline-none flex-1 w-full text-input"
                style={{
                  'min-height': '2rem',
                  'min-width': '100px',
                  'font-size': '16px',
                }}
                type={props.options?.hasTime ? 'datetime-local' : 'date'}
                onChange={(e) =>
                  setInputValues({
                    ...inputValues(),
                    from: e.currentTarget.value,
                  })
                }
                data-testid="from-date"
              />
            </div>
            {props.options?.isRange && (
              <div class="flex items-center p-4">
                {props.options.isRange && (
                  <p class="font-semibold">
                    {props.options.labels?.to ?? 'To:'}
                  </p>
                )}
                <input
                  class="focus:outline-none flex-1 w-full text-input ml-2"
                  style={{
                    'min-height': '2rem',
                    'min-width': '100px',
                    'font-size': '16px',
                  }}
                  type={props.options.hasTime ? 'datetime-local' : 'date'}
                  onChange={(e) =>
                    setInputValues({
                      ...inputValues(),
                      to: e.currentTarget.value,
                    })
                  }
                  data-testid="to-date"
                />
              </div>
            )}
          </div>

          <SendButton
            isDisabled={inputValues().to === '' && inputValues().from === ''}
            class="my-2 ml-2"
          >
            {props.options?.labels?.button ?? 'Send'}
          </SendButton>
        </form>
      </div>
    </div>
  )
}
