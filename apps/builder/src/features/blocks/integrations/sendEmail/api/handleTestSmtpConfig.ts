import { ORPCError } from "@orpc/server";
import { createTransport } from "nodemailer";
import { z } from "zod";
import { resolveSmtpHost } from "./resolveSmtpHost";

export const testSmtpConfigInputSchema = z.object({
  from: z.object({
    email: z.string().optional(),
    name: z.string().optional(),
  }),
  port: z.int().min(1).max(65535),
  isTlsEnabled: z.boolean().optional(),
  username: z.string(),
  password: z.string(),
  host: z.string(),
  to: z.string(),
});

export const handleTestSmtpConfig = async ({
  input,
}: {
  input: z.infer<typeof testSmtpConfigInputSchema>;
}) => {
  const { from, port, isTlsEnabled, username, password, host, to } = input;
  try {
    // A numeric host prevents Nodemailer DNS/cache/fallback and reconnect paths
    // from selecting a different address. STARTTLS upgrades the same socket.
    const destination = await resolveSmtpHost(host);
    const transporter = createTransport({
      ...destination,
      port,
      secure: isTlsEnabled ?? undefined,
      auth: {
        user: username,
        pass: password,
      },
    });
    const info = await transporter.sendMail({
      from: from.name ? `"${from.name}" <${from.email}>` : from.email,
      to,
      subject: "Your SMTP configuration is working 🤩",
      text: "This email has been sent to test out your SMTP config.\n\nIf your read this then it has been successful.🚀",
    });
    return { message: "Email sent!", info };
  } catch (err) {
    console.error(err);
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Failed to send email",
      cause: err,
    });
  }
};
