import { env } from "@typebot.io/env";
import { createTransport, type SendMailOptions } from "nodemailer";
import { runListSuppressedEmailsForRecipients } from "./suppressedEmails";

export const sendEmail = async (
  props: Pick<SendMailOptions, "to" | "html" | "subject" | "replyTo" | "text">,
) => {
  let suppressedEmails: string[] = [];
  try {
    suppressedEmails = await runListSuppressedEmailsForRecipients(props.to);
  } catch (error) {
    console.error("Failed to check suppressed emails", error);
  }

  if (suppressedEmails.length > 0) {
    console.warn("Email blocked because a recipient is suppressed", {
      suppressedEmails,
    });
    return;
  }

  const transporter = createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USERNAME,
      pass: env.SMTP_PASSWORD,
    },
  });

  return transporter.sendMail({
    from: env.NEXT_PUBLIC_SMTP_FROM,
    ...props,
  });
};
