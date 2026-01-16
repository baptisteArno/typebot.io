export const createEmailMagicLink = (
  token: string,
  email: string,
  redirectPath?: string,
) => {
  const normalizedEmail = normalizeEmailIdentifier(email);
  const url = new URL(`${window.location.origin}/api/auth/callback/nodemailer`);
  url.searchParams.set("token", token);
  url.searchParams.set("email", normalizedEmail);
  url.searchParams.set(
    "callbackUrl",
    `${window.location.origin}${redirectPath ?? "/typebots"}`,
  );
  return url.toString();
};

const normalizeEmailIdentifier = (identifier: string) => {
  const trimmed = identifier.trim().toLowerCase();
  const [local, domain] = trimmed.split("@");
  if (!domain) return trimmed;
  return `${local}@${domain.split(",")[0]}`;
};
