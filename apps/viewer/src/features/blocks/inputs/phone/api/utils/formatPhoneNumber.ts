import phone from 'phone'

export const formatPhoneNumber = (phoneNumber: string) =>
  phone(phoneNumber).phoneNumber
