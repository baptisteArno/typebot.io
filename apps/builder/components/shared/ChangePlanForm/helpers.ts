import { Plan } from 'db'
import { chatsLimit, prices, storageLimit } from 'utils'

export const computePrice = (
  plan: Plan,
  selectedTotalChatsIndex: number,
  selectedTotalStorageIndex: number
) => {
  if (plan !== Plan.STARTER && plan !== Plan.PRO) return
  const {
    increaseStep: { price: chatsPrice },
  } = chatsLimit[plan]
  const {
    increaseStep: { price: storagePrice },
  } = storageLimit[plan]
  return (
    prices[plan] +
    selectedTotalChatsIndex * chatsPrice +
    selectedTotalStorageIndex * storagePrice
  )
}

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

export const guessIfUserIsEuropean = () =>
  navigator.languages.some((language) => {
    const [languageCode, countryCode] = language.split('-')
    return countryCode
      ? europeanUnionCountryCodes.includes(countryCode)
      : europeanUnionExclusiveLanguageCodes.includes(languageCode)
  })

export const formatPrice = (price: number) => {
  const isEuropean = guessIfUserIsEuropean()
  const formatter = new Intl.NumberFormat(isEuropean ? 'fr-FR' : 'en-US', {
    style: 'currency',
    currency: isEuropean ? 'EUR' : 'USD',
    maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  })
  return formatter.format(price)
}
