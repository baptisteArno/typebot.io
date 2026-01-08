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
  workspaceName: string;
  totalChatsUsed: number;
  url: string;
}

export const BillingCycleResetEmail = ({
  workspaceName,
  totalChatsUsed,
  url,
}: Props) => {
  const readableChatsUsed = parseNumberWithCommas(totalChatsUsed);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Logo />
          <Text style={paragraph}>
            Your workspace <strong>{workspaceName}</strong> has experienced
            unusually high usage this billing cycle.
            <br />
            <br />
            We detected {readableChatsUsed} chats in a short period, which
            exceeded our fraud prevention threshold. To protect your account, we
            have reset your billing cycle early and charged you for the usage
            this period.
            <br />
            <br />
            Your new billing cycle has started, and you now have access to your
            full monthly chat allowance again.
            <br />
            <br />
            You can view your invoice and usage details in your workspace
            billing settings.
          </Text>

          <Button href={url} style={primaryButton}>
            View billing details
          </Button>

          <Hr style={hr} />
          <Text style={footerText}>Typebot - Build faster, Chat smarter</Text>
        </Container>
      </Body>
    </Html>
  );
};

BillingCycleResetEmail.PreviewProps = {
  workspaceName: "My Workspace",
  totalChatsUsed: 15000,
  url: "https://typebot.io",
} as Props;

export default BillingCycleResetEmail;

export const sendBillingCycleResetEmail = async ({
  to,
  ...props
}: Pick<SendMailOptions, "to"> &
  ComponentProps<typeof BillingCycleResetEmail>) =>
  sendEmail({
    to,
    subject: "Your billing cycle has been reset early",
    html: await render(<BillingCycleResetEmail {...props} />),
  });
