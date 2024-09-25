import { isPossiblePhoneNumber } from "react-phone-number-input";

export const validatePhoneNumber = (phoneNumber: string) =>
  isPossiblePhoneNumber(phoneNumber);
