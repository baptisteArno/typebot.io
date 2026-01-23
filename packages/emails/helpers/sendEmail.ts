import { env } from "@typebot.io/env";
import { createTransport, type SendMailOptions } from "nodemailer";
import {
  filterSuppressedRecipients,
  runListSuppressedEmailsForRecipients,
} from "./suppressedEmails";

export const sendEmail = async (
  props: Pick<SendMailOptions, "to" | "html" | "subject" | "replyTo" | "text">,
) => {
  let suppressedEmails: string[] = [];
  try {
    suppressedEmails = await runListSuppressedEmailsForRecipients(props.to);
  } catch (error) {
    console.error("Failed to check suppressed emails", error);
  }

  const suppressedCount = suppressedEmails.length;
  const filteredTo =
    suppressedCount > 0
      ? filterSuppressedRecipients(props.to, suppressedEmails)
      : props.to;

  if (suppressedCount > 0 && !filteredTo) {
    console.warn("Email blocked because all recipients are suppressed", {
      suppressedCount,
    });
    return;
  }

  if (suppressedCount > 0)
    console.warn("Suppressed recipients removed from email send", {
      suppressedCount,
    });

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
    to: filteredTo,
  });
};
