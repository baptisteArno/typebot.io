export const getEmailDomain = (email: string) =>
  email
    .slice(email.lastIndexOf("@") + 1)
    .trim()
    .toLowerCase();
