import { phone } from 'phone'

export const validatePhoneNumber = (phoneNumber: string) =>
  phone(phoneNumber).isValid
