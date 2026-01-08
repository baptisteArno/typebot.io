import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { parseNumberWithCommas } from "@typebot.io/lib/utils";
import type { SendMailOptions } from "nodemailer";
import type { ComponentProps } from "react";
// biome-ignore lint/correctness/noUnusedImports: Need it for tsx execution
import React from "react";
import { sendEmail } from "../helpers/sendEmail";
import { Logo } from "./components/Logo";
import {
  container,
  footerText,
  hr,
  main,
  paragraph,
  primaryButton,
} from "./styles";

interface Props {
  chatsLimit: number;
  url: string;
}

/**
 * to FREE workspaces or workspaces with `chatsHardLimit` set
 */
export const ReachedChatsLimitEmail = ({ chatsLimit, url }: Props) => {
  const readableChatsLimit = parseNumberWithCommas(chatsLimit);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Logo />
          <Text style={paragraph}>
            You&apos;ve reached your {readableChatsLimit} monthly chats limit.
            <br />
            <br />
            If you&apos;d like your bots to continue chatting with your users
            this month, then you need to upgrade your plan. 🚀
          </Text>

          <Button href={url} style={primaryButton}>
            Upgrade workspace
          </Button>

          <Hr style={hr} />
          <Text style={footerText}>Typebot - Build faster, Chat smarter</Text>
        </Container>
      </Body>
    </Html>
  );
};

ReachedChatsLimitEmail.PreviewProps = {
  chatsLimit: 10000,
  url: "https://typebot.io",
} as Props;

export default ReachedChatsLimitEmail;

export const sendReachedChatsLimitEmail = async ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> &
  ComponentProps<typeof ReachedChatsLimitEmail>) =>
  sendEmail({
    to,
    subject: `You've reached your monthly chats limit`,
    html: await render(<ReachedChatsLimitEmail {...props} />),
  });
