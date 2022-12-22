import { ShortTextInput } from '@/components/inputs'
import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { PhoneNumberInputBlock } from 'models'
import { createSignal, For } from 'solid-js'
import { phoneCountries } from 'utils/phoneCountries'

type PhoneInputProps = {
  block: PhoneNumberInputBlock & { prefilledValue?: string }
  onSubmit: (value: InputSubmitContent) => void
  hasGuestAvatar: boolean
}

export const PhoneInput = (props: PhoneInputProps) => {
  const [selectedCountryCode, setSelectedCountryCode] = createSignal('INT')
  const [inputValue, setInputValue] = createSignal(
    // eslint-disable-next-line solid/reactivity
    props.block.prefilledValue ?? ''
  )
  let inputRef: HTMLInputElement | undefined

  const handleInput = (inputValue: string | undefined) => {
    setInputValue(inputValue as string)
    const matchedCountry = phoneCountries.find(
      (country) =>
        country.dial_code === inputValue &&
        country.code !== selectedCountryCode()
    )
    if (matchedCountry) setSelectedCountryCode(matchedCountry.code)
  }

  const checkIfInputIsValid = () =>
    inputValue() !== '' && inputRef?.reportValidity()

  const submit = () => {
    if (checkIfInputIsValid()) props.onSubmit({ value: inputValue() })
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') submit()
  }

  const selectNewCountryCode = (
    event: Event & { currentTarget: { value: string } }
  ) => {
    setSelectedCountryCode(event.currentTarget.value)
  }

  return (
    <div
      class={
        'flex items-end justify-between rounded-lg pr-2 typebot-input w-full'
      }
      data-testid="input"
      style={{
        'margin-right': props.hasGuestAvatar ? '50px' : '0.5rem',
        'max-width': '400px',
      }}
      onKeyDown={submitWhenEnter}
    >
      <div class="flex flex-1">
        <select
          onChange={selectNewCountryCode}
          class="w-12 pl-2 focus:outline-none"
        >
          <option selected>
            {
              phoneCountries.find(
                (country) => selectedCountryCode() === country.code
              )?.flag
            }
          </option>
          <For
            each={phoneCountries.filter(
              (country) => country.code !== selectedCountryCode()
            )}
          >
            {(country) => (
              <option value={country.code}>
                {country.name} ({country.dial_code})
              </option>
            )}
          </For>
        </select>
        <ShortTextInput
          type="tel"
          ref={inputRef}
          value={inputValue()}
          onInput={handleInput}
          placeholder={
            props.block.options.labels.placeholder ?? 'Your phone number...'
          }
          autofocus={!isMobile()}
        />
      </div>

      <SendButton
        type="button"
        isDisabled={inputValue() === ''}
        class="my-2 ml-2"
        onClick={submit}
      >
        {props.block.options?.labels?.button ?? 'Send'}
      </SendButton>
    </div>
  )
}
