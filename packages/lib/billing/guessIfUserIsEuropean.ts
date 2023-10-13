const europeanUnionCountryCodes = [
  'AT',
  'BE',
  'BG',
  'CY',
  'CZ',
  'DE',
  'DK',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'HR',
  'HU',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SE',
  'SI',
  'SK',
]

const europeanUnionExclusiveLanguageCodes = [
  'fr',
  'de',
  'it',
  'el',
  'pl',
  'fi',
  'nl',
  'hr',
  'cs',
  'hu',
  'ro',
  'sl',
  'sv',
  'bg',
]

export const guessIfUserIsEuropean = () => {
  if (typeof window === 'undefined') return false
  return window.navigator.languages.some((language) => {
    const [languageCode, countryCode] = language.split('-')
    return countryCode
      ? europeanUnionCountryCodes.includes(countryCode)
      : europeanUnionExclusiveLanguageCodes.includes(languageCode)
  })
}
