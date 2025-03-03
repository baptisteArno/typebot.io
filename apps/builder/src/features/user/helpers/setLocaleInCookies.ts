export const setLocaleInCookies = (locale: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
};
