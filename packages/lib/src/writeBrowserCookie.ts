export const writeBrowserCookie = async (cookie: CookieInit): Promise<void> => {
  if (typeof window === "undefined") return;

  const cookieStoreApi =
    "cookieStore" in window ? window.cookieStore : undefined;

  if (!cookieStoreApi)
    throw new Error("CookieStore API is required to write browser cookies.");

  await cookieStoreApi.set(cookie);
};
