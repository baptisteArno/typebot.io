import {
  CountryCode,
  findPhoneNumbersInText,
  isSupportedCountry,
} from 'libphonenumber-js'

export const formatPhoneNumber = (
  phoneNumber: string,
  defaultCountryCode?: string
) =>
  findPhoneNumbersInText(
    phoneNumber,
    defaultCountryCode && isSupportedCountry(defaultCountryCode)
      ? (defaultCountryCode as CountryCode)
      : undefined
  ).at(0)?.number.number
