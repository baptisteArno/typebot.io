import { sendEmail } from "@typebot.io/emails/helpers/sendEmail";
import { env } from "@typebot.io/env";

type SendVerificationEmailProps = {
  email: string;
  url?: string;
  otp?: string;
};

export async function sendVerificationEmail({
  email,
  url,
  otp,
}: SendVerificationEmailProps): Promise<void> {
  const appName = env.APP_NAME;
  const subject = otp
    ? `Your verification code: ${otp}`
    : `Sign in to ${appName}`;

  const body = otp
    ? `Your verification code is: <strong>${otp}</strong><br/><br/>This code expires in 5 minutes.`
    : `Click the link below to sign in:<br/><br/><a href="${url}">Sign in</a><br/><br/>This link expires in 5 minutes.`;

  await sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Sign in to ${appName}</h2>
        <p>${body}</p>
        <p style="color: #666; font-size: 12px;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
