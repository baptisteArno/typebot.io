import { writeBrowserCookie } from "@typebot.io/lib/writeBrowserCookie";

export const setLocaleInCookies = async (locale: string) => {
  await writeBrowserCookie({
    name: "NEXT_LOCALE",
    value: encodeURIComponent(locale),
    path: "/",
    expires: Date.now() + 31_536_000_000,
  });
};
