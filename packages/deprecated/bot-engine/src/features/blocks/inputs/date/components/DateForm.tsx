import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { DateInputOptions } from '@typebot.io/schemas'
import { useState } from 'react'
import { parseReadableDate } from '../utils/parseReadableDate'

type DateInputProps = {
  onSubmit: (inputValue: InputSubmitContent) => void
  options?: DateInputOptions
}

export const DateForm = ({
  onSubmit,
  options,
}: DateInputProps): JSX.Element => {
  const { hasTime, isRange, labels } = options ?? {}
  const [inputValues, setInputValues] = useState({ from: '', to: '' })
  return (
    <div className="flex flex-col w-full lg:w-4/6">
      <div className="flex items-center">
        <form
          className={
            'flex justify-between rounded-lg typebot-input pr-2 items-end'
          }
          onSubmit={(e) => {
            if (inputValues.from === '' && inputValues.to === '') return
            e.preventDefault()
            onSubmit({
              value: `${inputValues.from}${
                isRange ? ` to ${inputValues.to}` : ''
              }`,
              label: parseReadableDate({ ...inputValues, hasTime, isRange }),
            })
          }}
        >
          <div className="flex flex-col">
            <div className={'flex items-center p-4 ' + (isRange ? 'pb-0' : '')}>
              {isRange && (
                <p className="font-semibold mr-2">{labels?.from ?? 'From:'}</p>
              )}
              <input
                className="focus:outline-none flex-1 w-full text-input"
                style={{
                  minHeight: '2rem',
                  minWidth: '100px',
                  fontSize: '16px',
                }}
                type={hasTime ? 'datetime-local' : 'date'}
                onChange={(e) =>
                  setInputValues({ ...inputValues, from: e.target.value })
                }
                data-testid="from-date"
              />
            </div>
            {isRange && (
              <div className="flex items-center p-4">
                {isRange && (
                  <p className="font-semibold">{labels?.to ?? 'To:'}</p>
                )}
                <input
                  className="focus:outline-none flex-1 w-full text-input ml-2"
                  style={{
                    minHeight: '2rem',
                    minWidth: '100px',
                    fontSize: '16px',
                  }}
                  type={hasTime ? 'datetime-local' : 'date'}
                  onChange={(e) =>
                    setInputValues({ ...inputValues, to: e.target.value })
                  }
                  data-testid="to-date"
                />
              </div>
            )}
          </div>

          <SendButton
            label={labels?.button ?? 'Send'}
            isDisabled={inputValues.to === '' && inputValues.from === ''}
            className="my-2 ml-2"
          />
        </form>
      </div>
    </div>
  )
}
