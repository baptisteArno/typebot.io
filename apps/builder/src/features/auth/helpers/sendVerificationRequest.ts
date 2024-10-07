import { sendLoginCodeEmail } from "@typebot.io/transactional/emails/LoginCodeEmail";

type Props = {
  identifier: string;
  url: string;
};

export const sendVerificationRequest = async ({ identifier, url }: Props) => {
  try {
    const code = extractCodeFromUrl(url);
    if (!code) throw new Error("Could not extract code from url");
    const redirectEmailUrl = new URL("/signin/email-redirect", url);
    redirectEmailUrl.searchParams.set("token", code);
    redirectEmailUrl.searchParams.set("email", identifier);
    const redirectPath = new URL(url).searchParams.get("redirectPath");
    if (redirectPath)
      redirectEmailUrl.searchParams.set("redirectPath", redirectPath);
    await sendLoginCodeEmail({
      url: redirectEmailUrl.toString(),
      code,
      to: identifier,
    });
  } catch (err) {
    console.error(err);
    throw new Error(`Magic link email could not be sent. See error above.`);
  }
};

const extractCodeFromUrl = (url: string) => {
  const urlParts = url.split("?");
  const queryParams = new URLSearchParams(urlParts[1]);
  return queryParams.get("token");
};
