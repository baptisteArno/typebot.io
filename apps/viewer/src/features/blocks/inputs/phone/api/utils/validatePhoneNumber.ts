import { isValidPhoneNumber } from 'libphonenumber-js'

export const validatePhoneNumber = (phoneNumber: string) =>
  isValidPhoneNumber(phoneNumber)
