const phoneRegex = /^\+?[0-9]{6,}$/

export const validatePhoneNumber = (phoneNumber: string) =>
  phoneRegex.test(phoneNumber)
