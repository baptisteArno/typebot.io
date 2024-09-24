import { getAuthenticatedUser } from "@/features/auth/helpers/getAuthenticatedUser";
import type { SmtpCredentials } from "@typebot.io/blocks-integrations/sendEmail/schema";
import { notAuthenticated } from "@typebot.io/lib/api/utils";
import type { NextApiRequest, NextApiResponse } from "next";
import { createTransport } from "nodemailer";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return notAuthenticated(res);
  if (req.method === "POST") {
    const { from, port, isTlsEnabled, username, password, host, to } = (
      typeof req.body === "string" ? JSON.parse(req.body) : req.body
    ) as SmtpCredentials["data"] & { to: string };
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
      res.status(200).send({ message: "Email sent!", info });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
};

export default handler;
