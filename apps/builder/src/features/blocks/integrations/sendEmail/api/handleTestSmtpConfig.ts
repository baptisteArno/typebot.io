import { ORPCError } from "@orpc/server";
import { createTransport } from "nodemailer";
import { z } from "zod";

export const testSmtpConfigInputSchema = z.object({
  from: z.object({
    email: z.string().optional(),
    name: z.string().optional(),
  }),
  port: z.number(),
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
  const transporter = createTransport({
    host,
    port,
    secure: isTlsEnabled ?? undefined,
    auth: {
      user: username,
      pass: password,
    },
  });

  try {
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
