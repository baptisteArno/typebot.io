export const formatPhoneNumberDisplayName = (phoneNumber: string) =>
  `${
    phoneNumber.startsWith("+") ? "" : "+"
  }${phoneNumber.replace(/[\s-]/g, "")}`;
