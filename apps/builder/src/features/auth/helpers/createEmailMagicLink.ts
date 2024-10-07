export const createEmailMagicLink = (
  token: string,
  email: string,
  redirectPath?: string,
) => {
  const url = new URL(`${window.location.origin}/api/auth/callback/email`);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  url.searchParams.set(
    "callbackUrl",
    `${window.location.origin}${redirectPath ?? "/typebots"}`,
  );
  return url.toString();
};
