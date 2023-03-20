import { parsePhoneNumber } from 'libphonenumber-js'

export const formatPhoneNumber = (phoneNumber: string) =>
  parsePhoneNumber(phoneNumber).formatInternational().replaceAll(' ', '')
