export const phoneNumberKey = "whatsapp-phone";

export const getPhoneNumberFromLocalStorage = () =>
  localStorage.getItem(phoneNumberKey);

export const setPhoneNumberInLocalStorage = (phoneNumber: string) => {
  localStorage.setItem(phoneNumberKey, phoneNumber);
};
