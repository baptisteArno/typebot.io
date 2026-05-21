export const normalizeWhatsAppPreviewPhoneNumber = (phoneNumber: string) =>
  phoneNumber.replace(/[\s+-]/g, "");
