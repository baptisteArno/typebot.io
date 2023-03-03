import { ShortTextInput } from '@/components'
import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import type { PhoneNumberInputOptions } from 'models'
import { createSignal, For, onMount } from 'solid-js'
import { isEmpty } from 'utils'
import { phoneCountries } from 'utils/phoneCountries'

type PhoneInputProps = Pick<
  PhoneNumberInputOptions,
  'labels' | 'defaultCountryCode'
> & {
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
  hasGuestAvatar: boolean
}

export const PhoneInput = (props: PhoneInputProps) => {
  const [selectedCountryCode, setSelectedCountryCode] = createSignal(
    isEmpty(props.defaultCountryCode) ? 'INT' : props.defaultCountryCode
  )
  const [inputValue, setInputValue] = createSignal(props.defaultValue ?? '')
  let inputRef: HTMLInputElement | undefined

  const handleInput = (inputValue: string | undefined) => {
    setInputValue(inputValue as string)
    if (
      (inputValue === '' || inputValue === '+') &&
      selectedCountryCode() !== 'INT'
    )
      setSelectedCountryCode('INT')
    const matchedCountry =
      inputValue?.startsWith('+') &&
      inputValue.length > 2 &&
      phoneCountries.reduce<typeof phoneCountries[number] | null>(
        (matchedCountry, country) => {
          if (
            !country?.dial_code ||
            (matchedCountry !== null && !matchedCountry.dial_code)
          ) {
            return matchedCountry
          }
          if (
            inputValue?.startsWith(country.dial_code) &&
            country.dial_code.length > (matchedCountry?.dial_code.length ?? 0)
          ) {
            return country
          }
          return matchedCountry
        },
        null
      )
    if (matchedCountry) setSelectedCountryCode(matchedCountry.code)
  }

  const checkIfInputIsValid = () =>
    inputValue() !== '' && inputRef?.reportValidity()

  const submit = () => {
    const selectedCountryDialCode = phoneCountries.find(
      (country) => country.code === selectedCountryCode()
    )?.dial_code
    if (checkIfInputIsValid())
      props.onSubmit({
        value: inputValue().startsWith('+')
          ? inputValue()
          : `${selectedCountryDialCode ?? ''}${inputValue()}`,
      })
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') submit()
  }

  const selectNewCountryCode = (
    event: Event & { currentTarget: { value: string } }
  ) => {
    setSelectedCountryCode(event.currentTarget.value)
  }

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus()
  })

  return (
    <div
      class={'flex items-end justify-between rounded-lg pr-2 typebot-input'}
      data-testid="input"
      style={{
        'margin-right': props.hasGuestAvatar ? '50px' : '8px',
        'max-width': '400px',
      }}
      onKeyDown={submitWhenEnter}
    >
      <div class="flex flex-1">
        <select
          onChange={selectNewCountryCode}
          class="w-12 pl-2 focus:outline-none rounded-lg typebot-country-select"
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
          placeholder={props.labels.placeholder ?? 'Your phone number...'}
          autofocus={!isMobile()}
        />
      </div>

      <SendButton
        type="button"
        isDisabled={inputValue() === ''}
        class="my-2 ml-2"
        on:click={submit}
      >
        {props.labels?.button ?? 'Send'}
      </SendButton>
    </div>
  )
}
