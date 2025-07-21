import ky from "ky";
import MailComposer from "nodemailer/lib/mail-composer";
import type { Attachment } from "nodemailer/lib/mailer";

type Props = {
  to?: string;
  from?: string;
  subject?: string;
  body?: string;
  attachmentUrls?: string[];
};

export const buildEmail = async ({
  to,
  from,
  subject,
  body,
  attachmentUrls,
}: Props) => {
  const attachments =
    attachmentUrls && attachmentUrls.length > 0
      ? await Promise.all(
          attachmentUrls.map<Promise<Attachment>>(async (url, index) => {
            const response = await ky.get(url);
            return {
              filename:
                url.split("/").pop()?.split("?")[0] ?? `attachment-${index}`,
              content: Buffer.from(await response.arrayBuffer()),
              contentType:
                response.headers.get("content-type") ??
                "application/octet-stream",
            };
          }),
        )
      : [];

  const mail = new MailComposer({
    to,
    from,
    subject,
    text: body,
    attachments,
  });

  return new Promise<Buffer>((resolve, reject) =>
    mail.compile().build((err, msg) => {
      if (err) reject(err);
      else resolve(msg);
    }),
  );
};
