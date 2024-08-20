import { ShortTextInput } from '@/components'
import { ChevronDownIcon } from '@/components/icons/ChevronDownIcon'
import { SendButton } from '@/components/SendButton'
import { InputSubmitContent } from '@/types'
import { isMobile } from '@/utils/isMobileSignal'
import { createSignal, For, onCleanup, onMount } from 'solid-js'
import { isEmpty } from '@typebot.io/lib'
import { phoneCountries } from '@typebot.io/lib/phoneCountries'
import { CommandData } from '@/features/commands/types'
import { PhoneNumberInputBlock } from '@typebot.io/schemas'
import { defaultPhoneInputOptions } from '@typebot.io/schemas/features/blocks/inputs/phone/constants'

type PhoneInputProps = Pick<
  NonNullable<PhoneNumberInputBlock['options']>,
  'labels' | 'defaultCountryCode'
> & {
  defaultValue?: string
  onSubmit: (value: InputSubmitContent) => void
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
      phoneCountries.reduce<(typeof phoneCountries)[number] | null>(
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
    inputRef?.value !== '' && inputRef?.reportValidity()

  const submit = () => {
    const selectedCountryDialCode = phoneCountries.find(
      (country) => country.code === selectedCountryCode()
    )?.dial_code
    if (checkIfInputIsValid()) {
      const val = inputRef?.value ?? inputValue()
      props.onSubmit({
        type: 'text',
        value: val.startsWith('+')
          ? val
          : `${selectedCountryDialCode ?? ''}${val}`,
      })
    } else inputRef?.focus()
  }

  const submitWhenEnter = (e: KeyboardEvent) => {
    if (e.key === 'Enter') submit()
  }

  const selectNewCountryCode = (
    event: Event & { currentTarget: { value: string } }
  ) => {
    const code = event.currentTarget.value
    setSelectedCountryCode(code)
    const dial_code = phoneCountries.find(
      (country) => country.code === code
    )?.dial_code
    if (inputValue() === '' && dial_code) setInputValue(dial_code)
    inputRef?.focus()
  }

  onMount(() => {
    if (!isMobile() && inputRef) inputRef.focus({ preventScroll: true })
    window.addEventListener('message', processIncomingEvent)
  })

  onCleanup(() => {
    window.removeEventListener('message', processIncomingEvent)
  })

  const processIncomingEvent = (event: MessageEvent<CommandData>) => {
    const { data } = event
    if (!data.isFromTypebot) return
    if (data.command === 'setInputValue') setInputValue(data.value)
  }

  return (
    <div
      class="typebot-input-form flex w-full gap-2 items-end max-w-[350px]"
      onKeyDown={submitWhenEnter}
    >
      <div class={'flex typebot-input w-full'}>
        <div class="relative typebot-country-select flex justify-center items-center">
          <div class="pl-2 pr-1 flex items-center gap-2">
            <span>
              {
                phoneCountries.find(
                  (country) => selectedCountryCode() === country.code
                )?.flag
              }
            </span>
            <ChevronDownIcon class="w-3" />
          </div>

          <select
            onChange={selectNewCountryCode}
            class="absolute top-0 left-0 w-full h-full cursor-pointer opacity-0"
          >
            <For each={phoneCountries}>
              {(country) => (
                <option
                  value={country.code}
                  selected={country.code === selectedCountryCode()}
                >
                  {country.name}{' '}
                  {country.dial_code ? `(${country.dial_code})` : ''}
                </option>
              )}
            </For>
          </select>
        </div>

        <ShortTextInput
          type="tel"
          ref={inputRef}
          value={inputValue()}
          onInput={handleInput}
          placeholder={
            props.labels?.placeholder ??
            defaultPhoneInputOptions.labels.placeholder
          }
          autofocus={!isMobile()}
        />
      </div>
      <SendButton type="button" class="h-[56px]" on:click={submit}>
        {props.labels?.button}
      </SendButton>
    </div>
  )
}
