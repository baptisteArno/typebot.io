import { sendMagicLinkEmail } from "@typebot.io/emails/emails/MagicLinkEmail";

type Props = {
  identifier: string;
  url: string;
};

export const sendVerificationRequest = async ({ identifier, url }: Props) => {
  try {
    await sendMagicLinkEmail({ url, to: identifier });
  } catch (err) {
    console.error(err);
    throw new Error(`Magic link email could not be sent. See error above.`);
  }
};
